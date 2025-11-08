export type PaperSupplier = {
  _id?: { $oid: string, },
  code: string,
  name: string,
  phone?: string,
  address?: string,
  email?: string,
  bank?: string,
  bankAccount?: string,
  note?: string,
};