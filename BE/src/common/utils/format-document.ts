import { Document } from "mongoose";

export function formatDoc<T extends Document>(
  doc: T,
): Omit<T, "_id"> & { id: string } {
  const id = doc.id as string;
  const obj = doc.toObject() as T;
  if (obj._id) delete obj._id;
  return { id, ...obj };
}
