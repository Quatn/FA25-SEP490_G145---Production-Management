export class QueryAllMOProductionOutputByDateRangeRequestDto {
  startDate?: Date;
  endDate?: Date;
}

export class QueryAllMOProductionOutputByDateRangeResponseDto {
  _id: string;
  code: string;
  manufacturingDate: Date;
  manufacturingDateAdjustment: Date;
  corrugatorProcess: {
    manufacturedAmount: number;
  };
  finishingProcesses: {
    code: string;
    requiredAmount: number;
    completedAmount: number;
    wareFinishingProcessType: {
      code: string;
    };
  }[];
}
