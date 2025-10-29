export type PaperType = {
    _id?: { $oid: string, },
    paperType: { $oid: string, },
    receivingDate: Date,
    weight: number,
};