// src/types/PaperTypes.ts
export type PaperSupplier = {
  id: string;
  name: string;
  code?: string;
  totalPaperPurchased?: number;
};

export type PaperColor = {
  id: string;
  colorName: string;
  colorCode?: string;
};

export type PaperType = {
  paperTypeId: string;
  supplierId: string;
  colorId: string;
  widthId: string;
  grammageId: string;
  name?: string;
};

export type PaperRoll = {
  paperRollId: string;
  name: string;
  paperTypeId: string;
  weight: number;
  receivingDate: string;
};

export type PaperRollTransaction = {
  id: string;
  paperRollId: string;
  timeStamp: string;
  transactionType: string;
  initialWeight: number;
  finalWeight: number;
  inCharge?: string;
};


export type PaperWidth = {
  id: string;
  widthMm: number;
};

export type PaperGrammage = {
  id: string;
  grammage: number;
};