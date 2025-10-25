import { EntityRow, BaseEntity } from "@/types/paperStorage.types";

export const initializeEntityRows = <T extends BaseEntity>(entities: T[]): EntityRow[] =>
    entities.map((e) => ({
        ...e,
        isEditing: false,
        isSaved: true,
        isLoading: false,
        error: {},
    }));

export const buildCounts = <T extends BaseEntity>(list: T[], key: keyof T): Map<string, number> => {
    const counts = new Map<string, number>();
    list.forEach((item) => {
        const val = item[key];
        if (val != null) {
            const strVal = String(val);
            counts.set(strVal, (counts.get(strVal) ?? 0) + 1);
        }
    });
    return counts;
};

export const buildAllCounts = <T extends BaseEntity>(list: T[], keys: (keyof T)[]): Record<string, Map<string, number>> =>
    keys.reduce((acc, key) => {
        acc[key as string] = buildCounts(list, key);
        return acc;
    }, {} as Record<string, Map<string, number>>);

export const validateEntityRows = (rows: EntityRow[]): EntityRow[] => {
    const counts = buildAllCounts(rows, ["code", "name"]);

    return rows.map((row) => {
        const error: EntityRow["error"] = {};

        if (!row.code.trim()) {
            error.code = "Thiếu mã";
        } else if (!/^[A-Z0-9]+$/.test(row.code)) {
            error.code = "Sai cú pháp";
        } else if ((counts.code.get(row.code) ?? 0) > 1) {
            error.code = "Trùng mã";
        }

        if (!row.name.trim()) {
            error.name = "Thiếu tên";
        } else if (!/^[A-ZÀ-Ỹ0-9 .,&()\-]+$/.test(row.name)) {
            error.name = "Sai cú pháp";
        } else if ((counts.name.get(row.name) ?? 0) > 1) {
            error.name = "Trùng tên";
        }

        return { ...row, error };
    });
};