import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const configuredSecret = process.env.ENCRYPTION_KEY;
  if (
    process.env.NODE_ENV === 'production' &&
    (!configuredSecret ||
      configuredSecret.length < 32 ||
      configuredSecret === '64-hex-char-encryption-key-for-oauth-tokens')
  ) {
    throw new Error('ENCRYPTION_KEY must be configured with at least 32 characters in production.');
  }
  const secret = configuredSecret || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts a sensitive string (such as LinkedIn access token or refresh token)
 */
export function encrypt(text: string): string {
  if (!text) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  // Format: iv:tag:encrypted
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts an encrypted token string
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return '';
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      // Return as-is if unencrypted fallback
      return encryptedText;
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const tag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return '';
  }
}
