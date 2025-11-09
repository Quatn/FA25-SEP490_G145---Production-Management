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
  fluteCombination: mongoose.Schema.Types.ObjectId | FluteCombination;

  @Prop({ required: true })
  @IsNumber()
  wareWidth: number;

  @Prop({ required: true })
  @Optional()
  @IsNumber()
  wareLength: number;

  @Prop({ required: false, type: Number, default: null })
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

  @Prop({ required: false, type: Number, default: null })
  @IsOptional()
  @IsNumber()
  warePerBlankAdjustment: number | null;

  @Prop({ required: false, type: Number, default: null })
  @IsOptional()
  @IsNumber()
  flapAdjustment: number | null;

  @Prop({ required: false, type: Number, default: null })
  @IsOptional()
  @IsNumber()
  flapOverlapAdjustment: number | null;

  @Prop({ required: false, type: Number, default: null })
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

  @Prop({ required: true, type: Number, default: null })
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

  @Prop({ required: false, type: String, default: null })
  @IsOptional()
  @IsString()
  faceLayerPaperType: string | null;

  @Prop({ required: false, type: String, default: null })
  @IsOptional()
  @IsString()
  EFlutePaperType: string | null;

  @Prop({ required: false, type: String, default: null })
  @IsOptional()
  @IsString()
  EBLinerLayerPaperType: string | null;

  @Prop({ required: false, type: String, default: null })
  @IsOptional()
  @IsString()
  BFlutePaperType: string | null;

  @Prop({ required: false, type: String, default: null })
  @IsOptional()
  @IsString()
  BACLinerLayerPaperType: string | null;

  @Prop({ required: false, type: String, default: null })
  @IsOptional()
  @IsString()
  ACFlutePaperType: string | null;

  @Prop({ required: false, type: String, default: null })
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

  @Prop({ required: false, type: String, default: null })
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

  @Prop({ required: false, default: "" })
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
