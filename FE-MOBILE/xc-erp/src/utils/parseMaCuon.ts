export function parseMaCuon(code?: string) {
  if (!code) return null;
  const parts = code.split("/");
  const color = parts[0] ?? "";
  const supplierCode = parts[1] ?? "";
  const width = parts[2] ?? "";
  const grammage = parts[3] ?? "";
  const tail = parts.slice(4).join("/") || "";
  const fullType = [color, supplierCode, width, grammage].filter(Boolean).join("/");
  return { fullType, color, supplierCode, width, grammage, tail };
}
