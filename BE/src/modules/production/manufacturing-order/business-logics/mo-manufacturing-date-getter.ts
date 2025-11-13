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
) => {
  return new Date(
    deliveryDate.getTime() -
    (check.in(customerCode, specialCustomerArray) ? aDay * 2 : aDay),
  );
};

