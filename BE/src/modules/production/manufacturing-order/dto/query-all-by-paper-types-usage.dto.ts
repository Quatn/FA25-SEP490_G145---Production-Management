import { ApiProperty } from "@nestjs/swagger";
import check from "check-types";
import { Transform } from "class-transformer";
import { IsArray } from "class-validator";

export class QueryAllByPaperTypesUsageRequestDto {
  @ApiProperty({ type: [String], example: ["M/145/110", "K/LE/145/140"] })
  @Transform(({ value }) => {
    const arr = check.array.of.string(value)
      ? value
      : String(value).split(",").filter(Boolean);

    return arr;
  })
  @IsArray()
  paperTypes?: string[];
}
