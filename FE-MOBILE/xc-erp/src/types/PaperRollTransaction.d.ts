export type PaperRollTransaction = {
  id: string;
  paperRollId: string;
  employeeId: string;
  timeStamp: string;
  transactionType: string;
  initialWeight: number;
  finalWeight: number;
  inCharge?: string;
};