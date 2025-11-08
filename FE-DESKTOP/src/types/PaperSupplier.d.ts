export type PaperSupplier = {
  _id?: { $oid: string, },
  code: string,
  name: string,
  phone?: string,
  address?: string,
  email?: string,
  note?: string,
  bank?: string,
  bankAccount?: string,
};