import check from "check-types";

export function formatDateToDDMMYYYY(date: Date | string | null | undefined) {
  if (!check.assigned(date)) {
    return "";
  }

  const d = (check.date(date)) ? date : new Date(date as string);

  if (!check.date(d)) {
    return "";
  }

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}
