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

export function minDate(a: string, b: string): string {
  const date = new Date(Math.min(new Date(a).getTime(), new Date(b).getTime()));
  return date.toISOString().split("T")[0];
}
