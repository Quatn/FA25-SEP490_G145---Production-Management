import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { FluteCombination } from "./flute-combination.schema";
import { WareManufacturingProcessType } from "./ware-manufacturing-process-type.schema";
import { BaseDenormalizedSchema } from "@/common/schemas/base.denormalized.schema";
import {
  IsArray,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import { PrintColor } from "./print-color.schema";
import { WareFinishingProcessType } from "./ware-finishing-process-type.schema";
import { Optional } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { RecalculateFlagPlugin } from "@/common/plugins/set-recalculate-flag-on-save.plugin";

@Schema({ timestamps: true })
export class Ware extends BaseDenormalizedSchema {
  @ApiProperty()
  @Prop({ required: true, unique: true })
  @IsString()
  code: string;

  @ApiProperty()
  @Prop({ required: true })
  @IsNumber()
  unitPrice: number;

  @ApiProperty()
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: FluteCombination.name,
  })
  fluteCombination: mongoose.Types.ObjectId | FluteCombination;

  @ApiProperty()
  @Prop({ required: true })
  @IsNumber()
  wareWidth: number;

  @ApiProperty()
  @Prop({ required: true })
  @Optional()
  @IsNumber()
  wareLength: number;

  @ApiProperty()
  @Prop({ required: false, type: Number, default: null })
  @IsOptional()
  @IsNumber()
  wareHeight: number | null;

  @ApiProperty()
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: WareManufacturingProcessType.name,
  })
  @IsMongoId()
  wareManufacturingProcessType:
    | mongoose.Types.ObjectId
    | WareManufacturingProcessType;

  @ApiProperty()
  @Prop({ required: false, type: Number, default: null })
  @IsOptional()
  @IsNumber()
  warePerBlankAdjustment: number | null;

  @ApiProperty()
  @Prop({ required: false, type: Number, default: null })
  @IsOptional()
  @IsNumber()
  flapAdjustment: number | null;

  @ApiProperty()
  @Prop({ required: false, type: Number, default: null })
  @IsOptional()
  @IsNumber()
  flapOverlapAdjustment: number | null;

  @ApiProperty()
  @Prop({ required: false, type: Number, default: null })
  @IsOptional()
  @IsNumber()
  crossCutCountAdjustment: number | null;

  @ApiProperty()
  @Prop({ required: true })
  @IsNumber()
  warePerBlank: number;

  @ApiProperty()
  @Prop({ required: true })
  @IsNumber()
  blankWidth: number;

  @ApiProperty()
  @Prop({ required: true })
  @IsNumber()
  blankLength: number;

  @ApiProperty()
  @Prop({ required: false, type: Number, default: null })
  @IsOptional()
  @IsNumber()
  flapLength: number | null;

  @ApiProperty()
  @Prop({ required: true })
  @IsNumber()
  margin: number;

  @ApiProperty()
  @Prop({ required: true })
  @IsNumber()
  paperWidth: number;

  @ApiProperty()
  @Prop({ required: true })
  @IsNumber()
  crossCutCount: number;

  @ApiProperty()
  @Prop({ required: false, type: String, default: null })
  @IsOptional()
  @IsString()
  faceLayerPaperType: string | null;

  @ApiProperty()
  @Prop({ required: false, type: String, default: null })
  @IsOptional()
  @IsString()
  EFlutePaperType: string | null;

  @ApiProperty()
  @Prop({ required: false, type: String, default: null })
  @IsOptional()
  @IsString()
  EBLinerLayerPaperType: string | null;

  @ApiProperty()
  @Prop({ required: false, type: String, default: null })
  @IsOptional()
  @IsString()
  BFlutePaperType: string | null;

  @ApiProperty()
  @Prop({ required: false, type: String, default: null })
  @IsOptional()
  @IsString()
  BACLinerLayerPaperType: string | null;

  @ApiProperty()
  @Prop({ required: false, type: String, default: null })
  @IsOptional()
  @IsString()
  ACFlutePaperType: string | null;

  @ApiProperty()
  @Prop({ required: false, type: String, default: null })
  @IsOptional()
  @IsString()
  backLayerPaperType: string | null;

  @ApiProperty()
  @Prop({ required: true })
  @IsNumber()
  volume: number;

  @ApiProperty()
  @Prop({ required: true })
  @IsNumber()
  warePerSet: number;

  @ApiProperty()
  @Prop({ required: true })
  @IsNumber()
  warePerCombinedSet: number;

  @ApiProperty()
  @Prop({ required: true })
  @IsNumber()
  horizontalWareSplit: number;

  @ApiProperty()
  @Prop({
    required: true,
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: PrintColor.name }],
  })
  @IsArray()
  printColors: mongoose.Types.ObjectId[] | PrintColor[];

  @ApiProperty()
  @Prop({ required: false, type: String, default: null })
  @IsOptional()
  @IsString()
  typeOfPrinter: string | null;

  @ApiProperty()
  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: WareFinishingProcessType.name,
      },
    ],
  })
  finishingProcesses: mongoose.Types.ObjectId[] | WareFinishingProcessType[];

  @ApiProperty()
  @Prop({ required: false, default: "" })
  @IsOptional()
  @IsString()
  note: string = "";
}

export type WareDocument = HydratedDocument<Ware>;

export const WareSchema = SchemaFactory.createForClass(Ware)
  .plugin(softDeletePlugin)
  .plugin(RecalculateFlagPlugin);
