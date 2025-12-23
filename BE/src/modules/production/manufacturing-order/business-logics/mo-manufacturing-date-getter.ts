import { dateDMYCompare } from "@/common/utils/dateDMYCompare";
import check from "check-types";

const specialCustomerArray = [
  "VSVIETNAM",
  "VPIC1",
  "VANPHONGPHAM",
  "THUOCLA",
  "MAYYEN",
  "NOITHAT",
  "COATS",
  "AROMA",
  "VINHHẠNH",
];

const aDay = 24 * 60 * 60 * 1000;

export const getManufacturingDate = (
  deliveryDate: Date,
  customerCode: string,
  pegDate: boolean = false,
) => {
  const adjustedDate = new Date(
    deliveryDate.getTime() -
    (check.in(customerCode, specialCustomerArray) ? aDay * 2 : aDay),
  );

  if (!pegDate) return adjustedDate;

  const currentDate = new Date();

  return (dateDMYCompare(currentDate, adjustedDate) ?? 0) < 0
    ? currentDate
    : adjustedDate;
};
