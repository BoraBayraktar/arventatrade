import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const ENCRYPTED_PREFIX = "enc:v1:";

function getSecretMaterial() {
  const source = process.env.MARKETPLACE_INTEGRATION_SECRET
    ?? process.env.DOCUMENT_PROVIDER_SECRET
    ?? process.env.AUTH_SECRET
    ?? "dev-marketplace-integration-secret-change-me";
  return createHash("sha256").update(source).digest();
}

export function isEncryptedIntegrationSecret(value: string | null | undefined) {
  return Boolean(value && value.startsWith(ENCRYPTED_PREFIX));
}

export class IntegrationSecretCryptoService {
  encrypt(plainText: string | null | undefined) {
    if (!plainText) {
      return null;
    }

    if (isEncryptedIntegrationSecret(plainText)) {
      return plainText;
    }

    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, getSecretMaterial(), iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });
    const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return `${ENCRYPTED_PREFIX}${Buffer.concat([iv, authTag, encrypted]).toString("base64url")}`;
  }

  decrypt(encryptedText: string | null | undefined) {
    if (!encryptedText) {
      return null;
    }

    if (!isEncryptedIntegrationSecret(encryptedText)) {
      return encryptedText;
    }

    const encoded = encryptedText.slice(ENCRYPTED_PREFIX.length);
    const payload = Buffer.from(encoded, "base64url");
    const iv = payload.subarray(0, IV_LENGTH);
    const authTag = payload.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = payload.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = createDecipheriv(ALGORITHM, getSecretMaterial(), iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  }
}

export const integrationSecretCryptoService = new IntegrationSecretCryptoService();
