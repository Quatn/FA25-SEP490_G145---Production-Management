import { PaperColor } from "./PaperColor";

export type PaperType = {
    _id?: string,
    paperColor: PaperColor,
    width: number,
    grammage: number,
};

export type PaperTypeRequest = {
    _id?: { $oid: string, },
    paperColorId: string; 
    width: number;
    grammage: number;
};