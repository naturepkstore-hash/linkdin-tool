import { loadEnvConfig } from '@next/env';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { Prisma, PrismaClient } from '@prisma/client';

loadEnvConfig(process.cwd());

function requiredEnvironmentVariable(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Set ${name} before running the SQLite-to-PostgreSQL migration.`);
  }
  return value;
}

const sqliteUrl = requiredEnvironmentVariable('SQLITE_DATABASE_URL');
const targetUrl = requiredEnvironmentVariable('TARGET_DATABASE_URL');
const sourceEncryptionKey = requiredEnvironmentVariable('ENCRYPTION_KEY');
const targetEncryptionKey = requiredEnvironmentVariable('TARGET_ENCRYPTION_KEY');

if (!sqliteUrl.startsWith('file:')) {
  throw new Error('Set SQLITE_DATABASE_URL to the existing SQLite database URL.');
}

if (!/^postgres(?:ql)?:\/\//.test(targetUrl)) {
  throw new Error('Set TARGET_DATABASE_URL to the target PostgreSQL connection URL.');
}

if (targetEncryptionKey.length < 32 || targetEncryptionKey.startsWith('64-hex-')) {
  throw new Error('TARGET_ENCRYPTION_KEY must be a real secret with at least 32 characters.');
}

function deriveEncryptionKey(secret: string): Buffer {
  return crypto.createHash('sha256').update(secret).digest();
}

function decryptWithKey(value: string, secret: string): string {
  const parts = value.split(':');
  if (parts.length !== 3) return value;

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    deriveEncryptionKey(secret),
    Buffer.from(parts[0], 'hex'),
  );
  decipher.setAuthTag(Buffer.from(parts[1], 'hex'));
  return decipher.update(parts[2], 'hex', 'utf8') + decipher.final('utf8');
}

function encryptWithKey(value: string, secret: string): string {
  if (!value) return value;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', deriveEncryptionKey(secret), iv);
  const encrypted = cipher.update(value, 'utf8', 'hex') + cipher.final('hex');
  return `${iv.toString('hex')}:${cipher.getAuthTag().toString('hex')}:${encrypted}`;
}

function reencryptField(
  rows: unknown[],
  field: string,
  sourceKey: string,
  destinationKey: string,
): unknown[] {
  return rows.map((row) => {
    if (!row || typeof row !== 'object' || !(field in row)) return row;
    const record = row as Record<string, unknown>;
    const value = record[field];
    if (typeof value !== 'string' || !value) return row;

    return {
      ...record,
      [field]: encryptWithKey(decryptWithKey(value, sourceKey), destinationKey),
    };
  });
}

const schemaPath = path.resolve('prisma/schema.prisma');
const temporarySchemaPath = path.resolve('prisma/schema.sqlite-migration.prisma');
const sqliteClientPath = path.resolve('node_modules/.prisma/sqlite-migration-client');
const prismaCliPath = path.resolve('node_modules/prisma/build/index.js');
const schema = readFileSync(schemaPath, 'utf8');

if (!/provider\s*=\s*"postgresql"/.test(schema) || !/url\s*=\s*env\("DATABASE_URL"\)/.test(schema)) {
  throw new Error('The Prisma schema does not match the expected PostgreSQL datasource.');
}

const sqliteSchema = schema
  .replace(/provider\s*=\s*"postgresql"/, 'provider = "sqlite"')
  .replace(/url\s*=\s*env\("DATABASE_URL"\)/, 'url = env("SQLITE_DATABASE_URL")')
  .replace(/^\s*directUrl\s*=\s*env\("DIRECT_DATABASE_URL"\)\r?\n/m, '')
  .replace(
    /(provider\s*=\s*"prisma-client-js")/,
    '$1\n  output = "../node_modules/.prisma/sqlite-migration-client"',
  );

if (sqliteSchema === schema) {
  throw new Error('Could not create the temporary SQLite Prisma schema.');
}

const modelDelegates = [
  'user',
  'socialAccount',
  'contentSeries',
  'hashtag',
  'post',
  'media',
  'seriesPost',
  'analytics',
  'scheduledJob',
  'auditLog',
  'notification',
  'userSettings',
] as const;

type PrismaClientWithDynamicModels = {
  $connect(): Promise<void>;
  $disconnect(): Promise<void>;
  [delegate: string]: unknown;
};

type MigratableModel = {
  count(): Promise<number>;
  findMany(): Promise<unknown[]>;
  createMany(args: { data: unknown[] }): Prisma.PrismaPromise<unknown>;
};

function getModel(client: object, delegate: string): MigratableModel {
  return (client as unknown as Record<string, unknown>)[delegate] as MigratableModel;
}

async function migrate(): Promise<void> {
  let sqlite: PrismaClientWithDynamicModels | undefined;
  const postgres = new PrismaClient({ datasources: { db: { url: targetUrl } } });

  try {
    writeFileSync(temporarySchemaPath, sqliteSchema, 'utf8');
    process.env.SQLITE_DATABASE_URL = sqliteUrl;

    execFileSync(
      process.execPath,
      [prismaCliPath, 'generate', '--schema', temporarySchemaPath],
      { stdio: 'inherit' },
    );

    const require = createRequire(path.resolve('package.json'));
    const sqliteClientModule = require(sqliteClientPath) as {
      PrismaClient: new (options: { datasources: { db: { url: string } } }) => PrismaClientWithDynamicModels;
    };
    sqlite = new sqliteClientModule.PrismaClient({
      datasources: { db: { url: sqliteUrl } },
    });

    await Promise.all([sqlite.$connect(), postgres.$connect()]);

    for (const delegate of modelDelegates) {
      const targetModel = getModel(postgres, delegate);
      if (await targetModel.count()) {
        throw new Error(`Target table for "${delegate}" is not empty; refusing to overwrite production data.`);
      }
    }

    const rowsByModel = new Map<string, unknown[]>();
    for (const delegate of modelDelegates) {
      const sourceModel = getModel(sqlite, delegate);
      rowsByModel.set(delegate, await sourceModel.findMany());
    }

    rowsByModel.set(
      'socialAccount',
      reencryptField(
        rowsByModel.get('socialAccount') ?? [],
        'accessTokenEncrypted',
        sourceEncryptionKey,
        targetEncryptionKey,
      ),
    );
    rowsByModel.set(
      'socialAccount',
      reencryptField(
        rowsByModel.get('socialAccount') ?? [],
        'refreshTokenEncrypted',
        sourceEncryptionKey,
        targetEncryptionKey,
      ),
    );
    rowsByModel.set(
      'userSettings',
      reencryptField(
        rowsByModel.get('userSettings') ?? [],
        'aiApiKeyEncrypted',
        sourceEncryptionKey,
        targetEncryptionKey,
      ),
    );

    const inserts = modelDelegates
      .map((delegate) => {
        const rows = rowsByModel.get(delegate) ?? [];
        const targetModel = getModel(postgres, delegate);
        return rows.length ? targetModel.createMany({ data: rows }) : undefined;
      })
      .filter((insert): insert is Prisma.PrismaPromise<unknown> => insert !== undefined);

    if (inserts.length) {
      await postgres.$transaction(inserts);
    }

    const copied = Object.fromEntries(
      modelDelegates.map((delegate) => [delegate, rowsByModel.get(delegate)?.length ?? 0]),
    );
    console.log('SQLite data copied to PostgreSQL:', JSON.stringify(copied));
  } finally {
    await Promise.all([sqlite?.$disconnect(), postgres.$disconnect()]);
    if (existsSync(temporarySchemaPath)) unlinkSync(temporarySchemaPath);
  }
}

migrate().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  const sanitized = [targetUrl, sqliteUrl]
    .filter((url): url is string => Boolean(url))
    .reduce((result, url) => result.replaceAll(url, '[redacted connection URL]'), message);
  console.error('SQLite-to-PostgreSQL migration failed:', sanitized);
  process.exitCode = 1;
});
