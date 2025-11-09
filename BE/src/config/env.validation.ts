import { plainToInstance, Transform } from "class-transformer";
import {
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from "class-validator";
import {
  ALLOWED_ENCRYPTION_ALGOS,
  ALLOWED_HASH_ALGOS,
  DEFAULT_ENCRYPTION_ALGO,
  DEFAULT_HASH_ALGO,
} from "./crypto-algorithms.config";

enum Environment {
  Development = "development",
  Production = "production",
  Test = "test",
  Provision = "provision",
}

class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment;

  @IsNumber()
  @IsOptional()
  PORT: number;

  @IsString()
  DB_URI: string;

  @IsString()
  DB_NAME: string;

  @IsString()
  JWT_SECRET: string;

  @IsOptional()
  @IsIn(ALLOWED_HASH_ALGOS)
  @Transform(({ value }): string => value || DEFAULT_HASH_ALGO)
  HASH_ALGORITHM: string = DEFAULT_HASH_ALGO;

  @IsOptional()
  @IsIn(ALLOWED_ENCRYPTION_ALGOS)
  @Transform(({ value }): string => value || DEFAULT_ENCRYPTION_ALGO)
  ENCRYPTION_ALGORITHM: string = DEFAULT_ENCRYPTION_ALGO;

  @IsString()
  ENCRYPTION_SECRET: string;
}

export function validateEnvs(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true, // automatically convert strings to numbers
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      `MISSING ENV FILE, OR ONE OR MORE ENV VARIABLES IS MISSING OR MISCONFIGURED. VALIDATION ERROR DETAILS:\n\r${errors.toString()} \n\rENSURE THAT '.env.development' IS PRESENT WHEN 'npm run start' OR 'npm run start:dev'`,
    );
  }

  return validatedConfig;
}
