import {
  AllowedEncryptionAlgos,
  AllowedHashAlgos,
} from "@/config/crypto-algorithms.config";
import { ConfigService } from "@nestjs/config";
import crypto from "crypto";
import bcrypt from "bcrypt";

const configService = new ConfigService();

const hashAlgorithm =
  configService.getOrThrow<AllowedHashAlgos>("HASH_ALGORITHM");
const encryptAlgorithm = configService.getOrThrow<AllowedEncryptionAlgos>(
  "ENCRYPTION_ALGORITHM",
);

console.log("util imported algos", hashAlgorithm, encryptAlgorithm);

export async function hash(text: string) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const salt = await bcrypt.genSalt(10);
  switch (hashAlgorithm) {
    case "bcrypt":
      console.log("Falling through");
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
      return await bcrypt.hash(text, salt);
    default:
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
      return await bcrypt.hash(text, salt);
  }
}

const key = Buffer.from(
  configService.getOrThrow<AllowedHashAlgos>("CRYPTO_KEY"),
  "hex",
);

console.log("util imported key", key);

const ivLength = 12;
const iv = crypto.randomBytes(ivLength);
const cipher = crypto.createCipheriv(
  encryptAlgorithm,
  key,
  iv,
) as crypto.CipherGCM;

export function encrypt(text: string) {
  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return (
    iv.toString("hex") +
    ":" +
    tag.toString("hex") +
    ":" +
    encrypted.toString("hex")
  );
}

export function decrypt(data: string) {
  const [ivHex, tagHex, encryptedHex] = data.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv(
    encryptAlgorithm,
    key,
    iv,
  ) as crypto.DecipherGCM;
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
