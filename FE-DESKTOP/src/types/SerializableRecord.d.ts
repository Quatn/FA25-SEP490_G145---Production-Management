/**
 * A type-safe, JSON-serializable object suitable for use
 * as RTK Query "query args" or request parameters.
 *
 * It recursively enforces that all properties are
 * primitives, arrays, or other serializable objects.
 */
export type SerializableRecord = {
  [key: string]:
    | string
    | number
    | boolean
    | null
    | undefined
    | SerializableRecord
    | (string | number | boolean | null | SerializableRecord)[];
};
