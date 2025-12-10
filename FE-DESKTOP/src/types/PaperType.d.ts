import { PaperColor } from "./PaperColor";

export type PaperType = {
    _id?: string,
    paperColor: PaperColor | string,
    width: number,
    grammage: number,
};
