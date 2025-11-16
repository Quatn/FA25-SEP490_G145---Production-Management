export interface Customer extends BaseSchema {
  code: string;
  name: string;
  address: string | null;
  email: string | null;
  contactNumber: string | null;
  note: string;
}
