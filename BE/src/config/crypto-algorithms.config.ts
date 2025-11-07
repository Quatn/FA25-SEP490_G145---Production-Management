export const DEFAULT_HASH_ALGO = "bcrypt";
export const ALLOWED_HASH_ALGOS = ["bcrypt", "argon2"];
export type AllowedHashAlgos = (typeof ALLOWED_HASH_ALGOS)[number];

export const DEFAULT_ENCRYPTION_ALGO = "aes-256-gcm";
export const ALLOWED_ENCRYPTION_ALGOS = [
  "aes-256-gcm",
  "aes-192-gcm",
  "aes-128-gcm",
];
export type AllowedEncryptionAlgos = (typeof ALLOWED_ENCRYPTION_ALGOS)[number];

export const DEFAULT_CRYPTO_KEY = "VbYGP&MpmKyEm9uBjtv@g54jP6pWDeTu";
