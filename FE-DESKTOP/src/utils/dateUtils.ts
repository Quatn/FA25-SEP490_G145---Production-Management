import check from "check-types";

export function formatDate(value?: string | Date | number | null): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return "";

  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();

  return `${dd}/${mm}/${yyyy}`;
}

export function formatDateTime(value?: string | Date | number | null): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return "";

  const hour = String(date.getHours());
  const minute = String(date.getMinutes());
  const second = String(date.getSeconds());
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();

  return `${hour}:${minute}:${second} ${dd}/${mm}/${yyyy}`;
}

export function dayGap(date?: string): number {
  if (!date) return 0;

  const created = new Date(date);
  if (isNaN(created.getTime())) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const createdDay = new Date(created);
  createdDay.setHours(0, 0, 0, 0);

  const diffMs = today.getTime() - createdDay.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function hourGap(date?: string): number {
  if (!date) return 0;

  const created = new Date(date);
  if (isNaN(created.getTime())) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const createdDay = new Date(created);
  createdDay.setHours(0, 0, 0, 0);

  const diffMs = today.getTime() - createdDay.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60));
}

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

export function formatDateToYYYYMMDD(date: Date | string | null | undefined) {
  if (!check.assigned(date)) {
    return "";
  }

  const d = (check.date(date)) ? date : new Date(date as string);

  if (!check.date(d)) {
    return "";
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function minDate(a: string, b: string): string {
  const date = new Date(Math.min(new Date(a).getTime(), new Date(b).getTime()));
  return date.toISOString().split("T")[0];
}
