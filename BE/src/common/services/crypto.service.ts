import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import crypto from "crypto";
import bcrypt from "bcrypt";
import {
  AllowedEncryptionAlgos,
  AllowedHashAlgos,
} from "@/config/crypto-algorithms.config";

@Injectable()
export class CryptoService {
  private readonly hashAlgorithm: AllowedHashAlgos;
  private readonly encryptAlgorithm: AllowedEncryptionAlgos;
  private readonly secretKey: Buffer;

  constructor(private readonly configService: ConfigService) {
    this.hashAlgorithm = this.configService.getOrThrow<AllowedHashAlgos>(
      "HASH_ALGORITHM",
    );
    this.encryptAlgorithm = this.configService.getOrThrow<
      AllowedEncryptionAlgos
    >(
      "ENCRYPTION_ALGORITHM",
    );

    const keyHex = this.configService.getOrThrow<string>("ENCRYPTION_SECRET");
    const maybeKey = Buffer.from(keyHex, "hex");

    if (maybeKey.length === 0 || maybeKey.length % 8 !== 0) {
      this.secretKey = crypto.pbkdf2Sync(
        keyHex,
        "erp-salt",
        100000,
        32,
        "sha256",
      );
    } else {
      this.secretKey = maybeKey;
    }
  }

  async hash(text: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(text, salt);
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(12); // New IV per encryption
    const cipher = crypto.createCipheriv(
      this.encryptAlgorithm,
      this.secretKey,
      iv,
    ) as crypto.CipherGCM;
    const encrypted = Buffer.concat([
      cipher.update(text, "utf8"),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();

    return `${iv.toString("hex")}:${tag.toString("hex")}:${
      encrypted.toString(
        "hex",
      )
    }`;
  }

  decrypt(data: string): string {
    const [ivHex, tagHex, encryptedHex] = data.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");

    const decipher = crypto.createDecipheriv(
      this.encryptAlgorithm,
      this.secretKey,
      iv,
    ) as crypto.DecipherGCM;
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  }
}
