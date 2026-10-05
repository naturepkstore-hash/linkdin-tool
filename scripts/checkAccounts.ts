import { PrismaClient } from '@prisma/client';
import { decrypt } from '../src/lib/encryption';

const prisma = new PrismaClient();

async function checkAccounts() {
  const accounts = await prisma.socialAccount.findMany({
    include: { user: true },
  });

  console.log('Found accounts:', accounts.length);
  for (const acc of accounts) {
    let tokenType = 'unknown';
    try {
      const dec = decrypt(acc.accessTokenEncrypted);
      tokenType = dec?.startsWith('simulated_') ? 'MOCK / SIMULATED' : 'REAL LIVE TOKEN';
    } catch {
      tokenType = 'decryption error';
    }
    console.log(`- ${acc.displayName} (${acc.providerAccountId}) | Status: ${acc.status} | Token Type: ${tokenType}`);
  }
}

checkAccounts()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
