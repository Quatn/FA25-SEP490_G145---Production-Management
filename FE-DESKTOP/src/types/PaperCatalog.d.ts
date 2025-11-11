export type PaperCatalog = {
    _id?: { $oid: string, },
    paperSupplierId: { $oid: string, },
    paperTypeId: { $oid: string, },
};