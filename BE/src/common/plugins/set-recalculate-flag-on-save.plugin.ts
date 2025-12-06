import { Schema } from "mongoose";

export interface RecalculateFlagPluginOptions {
  ignoredFields?: string[];
  flagField?: string;
}

export function RecalculateFlagPlugin(
  schema: Schema,
  options: RecalculateFlagPluginOptions = {},
) {
  const {
    ignoredFields = ["recalculateFlag", "updatedAt", "createdAt", "__v"],
    flagField = "recalculateFlag",
  } = options;

  schema.pre("save", function(next) {
    const modified = this.modifiedPaths();

    // allow manual flag setting
    if (!modified.includes(flagField)) {
      const shouldFlag = modified.some((path) => !ignoredFields.includes(path));

      if (shouldFlag) {
        this[flagField] = true;
      }
    }

    next();
  });
}
