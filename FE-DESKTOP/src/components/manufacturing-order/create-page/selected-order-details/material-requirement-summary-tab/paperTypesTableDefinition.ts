import { MaterialRequirementDto } from "@/types/DTO/material-requirement-summary/MaterialRequirement";
import { numToFixedBounded } from "@/utils/numToFixedBounded";
import { createColumnHelper } from "@tanstack/react-table";
import check from "check-types";

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

export const paperTypesTableColumns = (header: string) => [
  columnHelper.group({
    id: "table",
    header: header,
    columns: [
      columnHelper.display({
        id: "code",
        header: "Mã giấy",
        ...colSize.md,
        cell: ({ row }) =>
          row.original.code,
      }),
      columnHelper.display({
        id: "requirementWeight",
        header: "Trọng lượng sử dụng (kg)",
        ...colSize.sm,
        cell: ({ row }) =>
          numToFixedBounded(row.original.requirementWeight),
      }),
      columnHelper.display({
        id: "inventoryWeight",
        header: "Tồn kho (kg)",
        ...colSize.sm,
        cell: ({ row }) =>
          row.original.inventoryWeight.toFixed(4),
      }),
    ]
  })
]
