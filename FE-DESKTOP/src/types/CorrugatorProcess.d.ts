import { CorrugatorProcessStatus } from "./enums/CorrugatorProcessStatus";

export interface CorrugatorProcess {
  status: CorrugatorProcessStatus;
  manufacturedAmount: number;
  actualPaperWidth: number;
  actualRunningLength: number;
  note: string;
}
