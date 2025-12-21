import check from "check-types";

export function dateDMYCompare(
  date1: Date | string | null | undefined,
  date2: Date | string | null | undefined,
): number | undefined {
  if (!check.assigned(date1) || !check.assigned(date2)) {
    return undefined;
  }

  const d1 = check.date(date1) ? date1 : new Date(date1 as string);
  if (!check.date(d1)) {
    return undefined;
  }

  const d2 = check.date(date2) ? date2 : new Date(date2 as string);
  if (!check.date(d2)) {
    return undefined;
  }

  const year1 = d1.getFullYear();
  const year2 = d2.getFullYear();

  if (year1 < year2) return 1;
  if (year1 > year2) return -1;
  else {
    const month1 = d1.getMonth();
    const month2 = d2.getMonth();

    if (month1 < month2) return 1;
    if (month1 > month2) return -1;
    else {
      const day1 = d1.getDate();
      const day2 = d2.getDate();

      if (day1 < day2) return 1;
      if (day1 > day2) return -1;
      else {
        return 0;
      }
    }
  }
}
