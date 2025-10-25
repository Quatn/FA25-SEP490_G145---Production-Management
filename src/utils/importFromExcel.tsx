import * as XLSX from "xlsx";
import { EntityRow } from "@/types/paperStorage.types";

export const importEntitiesFromExcel = async (file: File): Promise<EntityRow[]> => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<{ code?: string; name?: string }>(sheet, {
    header: ["code", "name"],
    range: 1,
  });

  return rows.map((row) => ({
    code: String(row.code ?? "").trim(),
    name: String(row.name ?? "").trim(),
    isSaved: false,
    isEditing: true,
    isLoading: false,
    error: {},
  }));
};
