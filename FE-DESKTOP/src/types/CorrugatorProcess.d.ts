import { CorrugatorProcessStatus } from "./enums/CorrugatorProcessStatus";

export interface CorrugatorProcess {
  status: CorrugatorProcessStatus;
  manufacturedAmount: number;
  actualBlankWidth: number;
  actualRunningLength: number;
  note: string;
}
