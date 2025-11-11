// src/common/types/soft-delete-document.ts
import { Document } from "mongoose";

export interface SoftDeleteDocument extends Document {
  softDelete(): Promise<void>;
  restore(): Promise<void>;
  deleted?: boolean;
  deletedAt?: Date | null;
}
