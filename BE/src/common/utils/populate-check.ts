import check from "check-types";
import mongoose, { Types } from "mongoose";

export function isRefPopulated<T>(ref: T | Types.ObjectId): ref is T {
  return (
    !check.instance(ref, mongoose.Types.ObjectId) &&
    check.object(ref) &&
    "_id" in ref
  );
}
