export type Product = {
  id: string;
  code: string;
  customerCode: string;
  name: string;
  description: string;
  image: string | null;
  wareCodes: string[];
  note: string;
};
