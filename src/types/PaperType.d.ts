export type PaperType = {
    _id?: { $oid: string, },
    paperSupplier: { $oid: string, },
    paperColor: { $oid: string, },
    paperWidth: { $oid: string, },
    paperGrammage: { $oid: string, },
};