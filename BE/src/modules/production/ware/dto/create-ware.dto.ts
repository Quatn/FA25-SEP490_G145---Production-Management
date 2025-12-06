import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

export class CreateWareDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  unitPrice: number;

  @ApiProperty({ description: "FluteCombination ObjectId" })
  @IsMongoId()
  @IsNotEmpty()
  fluteCombination: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  wareWidth: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  wareLength: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  wareHeight?: number | null;

  @ApiProperty({ description: "WareManufacturingProcessType ObjectId" })
  @IsMongoId()
  @IsNotEmpty()
  wareManufacturingProcessType: string;

  @ApiProperty({ description: "Adjustment for warePerBlank (must be > 0)" })
  @Transform(({ value }) => (value === "" ? undefined : value))
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  warePerBlankAdjustment: number;

  @ApiProperty({ description: "Flap adjustment (must be > 0)" })
  @Transform(({ value }) => (value === "" ? undefined : value))
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  flapAdjustment: number;

  @ApiProperty({ description: "Flap overlap adjustment (must be > 0)" })
  @Transform(({ value }) => (value === "" ? undefined : value))
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  flapOverlapAdjustment: number;

  @ApiProperty({ description: "Cross cut count adjustment (must be > 0)" })
  @Transform(({ value }) => (value === "" ? undefined : value))
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  crossCutCountAdjustment: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === "" ? undefined : value)
  @Type(() => Number)
  @IsNumber()
  warePerBlank?: number | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === "" ? undefined : value)
  @Type(() => Number)
  @IsNumber()
  blankWidth?: number | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === "" ? undefined : value)
  @Type(() => Number)
  @IsNumber()
  blankLength?: number | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @Type(() => Number)
  @IsNumber()
  flapLength?: number | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === "" ? undefined : value)
  @Type(() => Number)
  @IsNumber()
  margin?: number | null;

  // make paperWidth optional (no longer required by frontend)
  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === "" ? undefined : value)
  @Type(() => Number)
  @IsNumber()
  paperWidth?: number | null;

  // make crossCutCount optional (no longer required by frontend)
  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === "" ? undefined : value)
  @Type(() => Number)
  @IsNumber()
  crossCutCount?: number | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  faceLayerPaperType?: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  EFlutePaperType?: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  EBLinerLayerPaperType?: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  BFlutePaperType?: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  BACLinerLayerPaperType?: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ACFlutePaperType?: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  backLayerPaperType?: string | null;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  volume: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  warePerSet: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  warePerCombinedSet: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  horizontalWareSplit: number;

  @ApiProperty({ type: [String], description: "Array of PrintColor ObjectIds" })
  @IsArray()
  @IsMongoId({ each: true })
  @IsNotEmpty()
  printColors: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  typeOfPrinter?: string | null;

  @ApiProperty({
    type: [String],
    description: "Array of WareFinishingProcessType ObjectIds",
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  finishingProcesses?: string[];

  // @ApiProperty({
  //   type: [String],
  //   description: "Array of ManufacturingProcess ObjectIds",
  // })
  // @IsArray()
  // @IsMongoId({ each: true })
  // @IsOptional()
  // manufacturingProcesses?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;
}

