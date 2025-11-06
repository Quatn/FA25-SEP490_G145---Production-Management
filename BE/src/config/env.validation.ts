import { plainToInstance } from "class-transformer";
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from "class-validator";

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
