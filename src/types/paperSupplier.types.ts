export interface PaperSupplier {
  _id?: { $oid: string; };
  code: string;
  name: string;
}

export interface PaperSuppliersResponse {
  paperSuppliers: PaperSupplier[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface SupplierRow {
  code: string,
  name: string,
  error?: {
    code?: string;
    name?: string;
  };
  isSaved: boolean,
  isEditing: boolean,
  isLoading?: boolean,
  isDeleting?: boolean,
}

