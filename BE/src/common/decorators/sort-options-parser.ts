import check from "check-types";
import { Transform } from "class-transformer";

export function ParseSortOptions<TOption extends Record<string, string>>(
  enumObj: TOption,
  ascPostfix = "_asc",
  descPostfix = "_desc",
) {
  return Transform(({ value }) => {
    const arr = Array.isArray(value)
      ? value
      : String(value).split(",").filter(Boolean);

    return arr.map((v) => {
      if (check.string(v)) {
        const value = v.endsWith(ascPostfix)
          ? 1
          : v.endsWith(descPostfix)
            ? -1
            : undefined;
        if (check.undefined(value)) return undefined;

        const option = v.slice(
          0,
          -(value == 1 ? ascPostfix.length : descPostfix.length),
        );

        if (Object.values(enumObj).includes(option)) return { option, value };
      }

      return undefined;
    });
  });
}
