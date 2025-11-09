type Serialized<T> = T extends string | number | boolean | null ? T
  : T extends Date ? string
  : T extends (infer U)[] ? Serialized<U>[]
  : T extends Map<_, infer V> ? Record<string, Serialized<V>>
  : T extends Set<infer U> ? Serialized<U>[]
  : T extends object ? { [K in keyof T]: Serialized<T[K]> }
  : never;
