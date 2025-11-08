export type PaperCatalog = {
    _id?: { $oid: string, },
    paperSupplier: { $oid: string, },
    PaperSpecification: { $oid: string, },
};