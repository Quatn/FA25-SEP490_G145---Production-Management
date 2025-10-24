import * as XLSX from "xlsx";
import { PaperSupplier, SupplierRow } from "@/types/paperSupplier.types";
import { validateSuppliers } from "./validationUtils";

export const importSuppliersFromExcel = async (
    file: File,
    existingSuppliers: PaperSupplier[]
): Promise<SupplierRow[]> => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<{ code?: string; name?: string }>(sheet, {
        header: ["code", "name"],
        range: 1,
    });

    const rawRows: SupplierRow[] = [];

    for (const row of rows) {
        const code = String(row.code ?? "").trim();
        const name = String(row.name ?? "").trim();

        rawRows.push({
            code,
            name,
            isSaved: false,
            isEditing: true,
            isLoading: false,
            error: {},
        });
    }

    return validateSuppliers(rawRows, existingSuppliers);
};
