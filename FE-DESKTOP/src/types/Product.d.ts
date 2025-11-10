import { Customer } from "./Customer";
import { Ware } from "./Ware";

export interface Product extends BaseSchema {
  code: string;
  name: string;
  description: string;
  image: string | null;
  note: string;

  customer?: Customer;
  wares?: Ware[];
}
