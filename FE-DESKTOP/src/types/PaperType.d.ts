import { PaperColor } from "./PaperColor";

export type PaperType = {
    _id?: string,
    paperColorId?: string; 
    paperColor?: PaperColor,
    width: number,
    grammage: number,
};
