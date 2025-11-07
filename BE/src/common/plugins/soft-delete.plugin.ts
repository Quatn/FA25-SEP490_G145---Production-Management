import { Aggregate, Query, Schema } from "mongoose";
import { BaseSchema } from "../schemas/base.schema";

export function softDeletePlugin<T extends BaseSchema>(schema: Schema<T>) {
  // Automatically filter isDeleted = false
  schema.pre<Query<any, T>>(/^find/, function(next) {
    this.where({ isDeleted: { $ne: true } });
    next();
  });

  schema.pre<Aggregate<any>>("aggregate", function(next) {
    this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
    next();
  });

  // Add helper to "soft delete", if I know how to make it work
  /*
  schema.methods.softDelete = async function(this: T) {
    this.isDeleted = true;
    await this.save();
  };
  */
}
