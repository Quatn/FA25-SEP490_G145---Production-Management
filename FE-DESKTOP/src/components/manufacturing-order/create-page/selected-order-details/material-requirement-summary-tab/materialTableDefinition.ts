import { MaterialRequirementDto } from "@/types/DTO/material-requirement-summary/MaterialRequirement";
import { createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<Serialized<MaterialRequirementDto>>();

const colSize = {
  sm: {
    minSize: 50,
    size: 75,
    maxSize: 100,
  },
  md: {
    minSize: 100,
    size: 150,
    maxSize: 200,
  },
  lg: {
    minSize: 200,
    size: 300,
    maxSize: 400,
  },
}

export const materialRequirementColumns = [
  columnHelper.display({
    id: "code",
    header: "Mã giấy",
    ...colSize.md,
    cell: ({ row }) =>
      row.original.code,
  }),
  columnHelper.display({
    id: "requirementWeight",
    header: "Trọng lượng sử dựng (kg)",
    ...colSize.sm,
    cell: ({ row }) =>
      row.original.requirementWeight,
  }),
  columnHelper.display({
    id: "inventoryWeight",
    header: "Tồn kho (kg)",
    ...colSize.sm,
    cell: ({ row }) =>
      row.original.inventoryWeight,
  }),
  columnHelper.display({
    id: "status",
    header: "Trạng thái",
    ...colSize.sm,
    cell: ({ row }) =>
      row.original.status,
  }),
]
