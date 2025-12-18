import { BadRequestException } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import check from "check-types";
import { Transform } from "class-transformer";
import { IsDate } from "class-validator";

export class QueryAllMOProductionOutputByDateRangeRequestDto {
  @ApiProperty({ required: false, type: String, example: "2025-11-21" })
  @Transform(({ value }) => {
    if (check.string(value)) {
      const date = new Date(value);
      if (check.date(date)) {
        date.setHours(0, 0, 0, 0);
        return date;
      }
      throw new BadRequestException("Invalid startDate");
    }

    return undefined;
  })
  @IsDate()
  startDate?: Date;

  @ApiProperty({ required: false, type: String, example: "2025-11-21" })
  @Transform(({ value }) => {
    if (check.string(value)) {
      const date = new Date(value);
      if (check.date(date)) {
        date.setHours(23, 59, 59, 999);
        return date;
      }
      throw new BadRequestException("Invalid endDate");
    }

    return undefined;
  })
  @IsDate()
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
    warefinishingprocesstype: {
      code: string;
    };
  }[];
}
