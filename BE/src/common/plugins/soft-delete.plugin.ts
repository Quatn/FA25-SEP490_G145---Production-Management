import { Aggregate, Query, Schema } from "mongoose";
import { BaseSchema } from "../schemas/base.schema";

export function softDeletePlugin<T extends BaseSchema>(schema: Schema<T>) {
  // Automatically filter isDeleted = false
  schema.pre<Query<any, T>>(/^find/, function (next) {
    this.where({ isDeleted: { $ne: true } });
    next();
  });

  schema.pre<Aggregate<any>>("aggregate", function (next) {
    this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
    next();
  });

  schema.methods.softDelete = async function (this: any) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    await this.save();
  };

  schema.methods.restore = async function (this: any) {
    this.isDeleted = false;
    this.deletedAt = null;
    await this.save();
  };
}
