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

@Schema({ timestamps: true })
export class Ware extends BaseDenormalizedSchema {
  @Prop({ required: true, unique: true })
  @IsString()
  code: string;

  @Prop({ required: true })
  @IsNumber()
  unitPrice: number;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: FluteCombination.name,
  })
  fluteCombinationCode: mongoose.Schema.Types.ObjectId | FluteCombination;

  @Prop({ required: true })
  @IsNumber()
  wareWidth: number;

  @Prop({ required: true })
  @IsNumber()
  wareLength: number;

  @Prop({ required: true })
  @IsOptional()
  @IsNumber()
  wareHeight: number | null;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: WareManufacturingProcessType.name,
  })
  @IsMongoId()
  wareManufacturingProcessType:
    | mongoose.Schema.Types.ObjectId
    | WareManufacturingProcessType;

  @Prop({ required: true })
  @IsOptional()
  @IsNumber()
  warePerBlankAdjustment: number | null;

  @Prop({ required: true })
  @IsOptional()
  @IsNumber()
  flapAdjustment: number | null;

  @Prop({ required: true })
  @IsOptional()
  @IsNumber()
  flapOverlapAdjustment: number | null;

  @Prop({ required: true })
  @IsOptional()
  @IsNumber()
  crossCutCountAdjustment: number | null;

  @Prop({ required: true })
  @IsNumber()
  warePerBlank: number;

  @Prop({ required: true })
  @IsNumber()
  blankWidth: number;

  @Prop({ required: true })
  @IsNumber()
  blankLength: number;

  @Prop({ required: true })
  @IsOptional()
  @IsNumber()
  flapLength: number | null;

  @Prop({ required: true })
  @IsNumber()
  margin: number;

  @Prop({ required: true })
  @IsNumber()
  paperWidth: number;

  @Prop({ required: true })
  @IsNumber()
  crossCutCount: number;

  @Prop({ required: true })
  @IsOptional()
  @IsString()
  faceLayerPaperType: string | null;

  @Prop({ required: true })
  @IsOptional()
  @IsString()
  EFlutePaperType: string | null;

  @Prop({ required: true })
  @IsOptional()
  @IsString()
  EBLinerLayerPaperType: string | null;

  @Prop({ required: true })
  @IsOptional()
  @IsString()
  BFlutePaperType: string | null;

  @Prop({ required: true })
  @IsOptional()
  @IsString()
  BACLinerLayerPaperType: string | null;

  @Prop({ required: true })
  @IsOptional()
  @IsString()
  ACFlutePaperType: string | null;

  @Prop({ required: true })
  @IsOptional()
  @IsString()
  backLayerPaperType: string | null;

  @Prop({ required: true })
  @IsNumber()
  volume: number;

  @Prop({ required: true })
  @IsNumber()
  warePerSet: number;

  @Prop({ required: true })
  @IsNumber()
  warePerCombinedSet: number;

  @Prop({ required: true })
  @IsNumber()
  horizontalWareSplit: number;

  @Prop({
    required: true,
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: PrintColor.name }],
  })
  @IsArray()
  printColors: mongoose.Schema.Types.ObjectId[] | PrintColor[];

  @Prop({ required: true })
  @IsOptional()
  @IsString()
  typeOfPrinter: string | null;

  @Prop({
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: WareFinishingProcessType.name,
    }],
  })
  finishingProcesses:
    | mongoose.Schema.Types.ObjectId[]
    | WareFinishingProcessType[];

  @Prop({ required: true })
  @IsOptional()
  @IsString()
  note: string = "";
}

export type WareDocument = HydratedDocument<Ware>;

export const WareSchema = SchemaFactory.createForClass(
  Ware,
).plugin(
  softDeletePlugin,
);
