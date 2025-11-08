export type PaperSpecification = {
    _id?: { $oid: string, },
    paperColor: { $oid: string, },
    width: number,
    grammage: number,
};