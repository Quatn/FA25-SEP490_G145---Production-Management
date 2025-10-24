import { PaperSupplier, SupplierRow } from "@/types/paperSupplier.types";
import check from "check-types";

export const buildCounts = <S extends Record<string, any>, R extends Record<string, any>>(
  listA: S[],
  listB: R[],
  key: keyof S & keyof R
): Map<string, number> => {
  const counts = new Map<string, number>();

  const increment = (val?: string | null) => {
    if (!val) return;
    counts.set(val, (counts.get(val) ?? 0) + 1);
  };

  [...listA, ...listB].forEach((item) => increment(item[key] as string));
  return counts;
};

export const buildAllCounts = <S extends Record<string, any>, R extends Record<string, any>>(
  listA: S[],
  listB: R[],
  keys: (keyof S & keyof R)[]
): Record<string, Map<string, number>> => {
  return keys.reduce<Record<string, Map<string, number>>>((acc, key) => {
    acc[key as string] = buildCounts(listA, listB, key);
    return acc;
  }, {});
};


export const validateSuppliers = (rows: SupplierRow[], suppliers: PaperSupplier[]): SupplierRow[] => {
  const keys: (keyof PaperSupplier & keyof SupplierRow)[] = ["name", "code"];
  const counts = buildAllCounts(suppliers, rows, keys);

  return rows.map((row) => {
    const error: SupplierRow["error"] = {};

    if (!check.nonEmptyString(row.code)) {
      error.code = "Thiếu mã";
    } else if (!/^[A-Z0-9]+$/.test(row.code)) {
      error.code = "Sai cú pháp";
    } else if ((counts.code?.get(row.code) ?? 0) > 1) {
      error.code = "Trùng mã";
    }

    if (!check.nonEmptyString(row.name)) {
      error.name = "Thiếu tên";
    } else if (!/^[A-ZÀ-Ỹ0-9]+(?:\s{0,1}[A-ZÀ-Ỹ0-9]+)*$/.test(row.name)) {
      error.name = "Sai cú pháp";
    } else if ((counts.name?.get(row.name) ?? 0) > 1) {
      error.name = "Trùng tên";
    }

    return { ...row, error };
  });
};
