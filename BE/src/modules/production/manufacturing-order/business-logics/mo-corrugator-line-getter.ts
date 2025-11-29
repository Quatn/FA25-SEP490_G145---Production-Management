import check from "check-types";
import { CorrugatorLine } from "../../schemas/manufacturing-order.schema";

const specialFluteComminations = [
  "2E",
  "3E",
  "2C",
  "3C",
  "4BE",
  "5BE",
  "4CB",
  "5CB",
  "7CBE",
];

const specialCustomerArray = [
  { customer: "NỘI THẤT 190", combination: "3B" },
  { customer: "KANEPACKAGE", combination: "3B" },
];

// Original recipe
// IF(
// OR(E5="2E",E5="3E",E5="2C",E5="3C",E5="4BE",E5="5BE",E5="4CB",E5="5CB",E5="7CBE",AND(C5="NỘI THẤT 190",E5="3B"),AND(C5="KANEPACKAGE",E5="3B"))
// ,7
// ,5
// )

export const getCorrugatorLine = (
  fluteCommination: string,
  customerCode: string,
): CorrugatorLine => {
  for (const o of specialCustomerArray) {
    if (
      check.like({ customer: customerCode, combination: fluteCommination }, o)
    ) {
      return CorrugatorLine.L7;
    }
  }

  return check.in(fluteCommination, specialFluteComminations)
    ? CorrugatorLine.L7
    : CorrugatorLine.L5;
};
