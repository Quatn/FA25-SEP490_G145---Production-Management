import { ApiProperty } from "@nestjs/swagger";
import check from "check-types";
import { Transform } from "class-transformer";
import { IsArray } from "class-validator";

export class QueryByWarePaperTypeCodesRequestDto {
  @ApiProperty({ type: [String] })
  @Transform(({ value }) => {
    const arr = check.array.of.string(value)
      ? value
      : String(value).split(",").filter(Boolean);

    return arr;
  })
  @IsArray()
  codes: string[];
}
