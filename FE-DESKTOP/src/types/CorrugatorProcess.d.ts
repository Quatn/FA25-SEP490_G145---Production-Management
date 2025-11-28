import { CorrugatorProcessStatus } from "./enums/CorrugatorProcessStatus";

export interface CorrugatorProcess {
  manufacturedAmount: number;
  status: CorrugatorProcessStatus;
  note: string;
}
