
export interface BaseEntity {
  _id?: { $oid: string; };
  code: string;
  name: string;
}

export interface EntityRow extends BaseEntity {
  isSaved: boolean;
  isEditing: boolean;
  isLoading?: boolean;
  isDeleting?: boolean;
  error: Partial<Record<keyof BaseEntity, string>>;
}

export interface UseEntityFormOptions<T extends BaseEntity> {
  initialData?: T[];
  onSave: (entity: T) => Promise<{ success: boolean; message: string; }>;
  onUpdate: (entity: T) => Promise<{ success: boolean; message: string; }>;
  onDelete: (code: string) => Promise<{ success: boolean; message: string; }>;
  entityLabel?: string;
}

export interface PaperSupplier extends BaseEntity { }

export interface PaperColor extends BaseEntity { }

export interface PaperSuppliersResponse {
  paperSuppliers: PaperSupplier[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface PaperColorsResponse {
  paperColors: PaperColor[];
  total?: number;
  page?: number;
  limit?: number;
}

