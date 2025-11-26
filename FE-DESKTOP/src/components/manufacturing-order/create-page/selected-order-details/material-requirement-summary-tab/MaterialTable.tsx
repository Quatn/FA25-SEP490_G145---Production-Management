"use client";

import { useGetMaterialRequirementsQuery } from "@/service/api/materialRequirementApiSlice";
import { MaterialRequirementDto } from "@/types/DTO/material-requirement-summary/MaterialRequirement";
import { Box, BoxProps, Center, Spinner, Stack, Table, TableRootProps, TabsRootProps, Text } from "@chakra-ui/react";
import { Column, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useEffect, useMemo, useReducer, useState } from "react";
import { materialRequirementColumns } from "./materialTableDefinition";
import check from "check-types";
import { useSelectedOrdersState } from "../TabbedContainer";
import { ManufacturingOrder } from "@/types/ManufacturingOrder";
import { Ware } from "@/types/Ware";
import { PurchaseOrderItem } from "@/types/PurchaseOrderItem";
import { useGetDraftFullDetailManufacturingOrdersByPoiIdsQuery } from "@/service/api/manufacturingOrderApiSlice";
import { useManufacturingOrderCreatePageState } from "@/context/manufacturing-order/manufacturingOrderCreatePageContext";
import { recalculatePurchaseOrderItem, recalculateWare } from "@/service/mock-data/recalculation";

export type MaterialRequirementTableProps = {
  rootProps?: BoxProps;
  tabsRootProps?: TabsRootProps;
  tableRootProps?: TableRootProps;
  type: "FACE" | "RAW"
};

function accumulateMaterialRequirements(
  items: Serialized<ManufacturingOrder>[] | undefined,
  type?: "FACE" | "RAW"
): MaterialRequirementDto[] {
  if (check.undefined(items)) return []

  const requirementMap: Map<string, number> = new Map();

  const poi = items.map(mo => mo.purchaseOrderItem)
  const ware = items.map(mo => mo.purchaseOrderItem?.ware)

  if (check.undefined(poi) || check.undefined(ware)) return []

  // List of all paper type and weight field pairs
  const fields: { type: keyof Ware; weight: keyof PurchaseOrderItem }[] = [
    { type: "faceLayerPaperType", weight: "faceLayerPaperWeight" },
    { type: "EFlutePaperType", weight: "EFlutePaperWeight" },
    { type: "EBLinerLayerPaperType", weight: "EBLinerLayerPaperWeight" },
    { type: "BFlutePaperType", weight: "BFlutePaperWeight" },
    { type: "BACLinerLayerPaperType", weight: "BACLinerLayerPaperWeight" },
    { type: "ACFlutePaperType", weight: "ACFlutePaperWeight" },
    { type: "backLayerPaperType", weight: "backLayerPaperWeight" },
  ];

  for (const item of items) {
    for (const pair of fields) {
      const code = item.purchaseOrderItem!.ware![pair.type] as string;
      const weight = item.purchaseOrderItem![pair.weight];

      if (code && check.equal(code.startsWith("M"), type === "RAW") && typeof weight === "number") {
        const current = requirementMap.get(code) || 0;
        requirementMap.set(code, current + weight);
      }
    }
  }

  // temp
  const inventoryWeight = 0

  // Convert map to array of MaterialRequirementDto
  const result: MaterialRequirementDto[] = [];
  for (const [code, requirementWeight] of requirementMap) {
    result.push({
      code,
      requirementWeight,
      inventoryWeight, // Set to 0 or update as needed
      status: (requirementWeight > inventoryWeight) ? `Thiếu ${(requirementWeight - inventoryWeight).toFixed(4)} kg` : "Đủ",  // Set a default status or update as needed
    });
  }

  return result;
}

export default function MaterialRequirementTable(
  props: MaterialRequirementTableProps,
) {
  const { selectedPOIsIds } = useManufacturingOrderCreatePageState();

  const {
    data: fullDetailMOsResponse,
    error: fetchError,
    isLoading: isFetchingList,
  } = useGetDraftFullDetailManufacturingOrdersByPoiIdsQuery({
    ids: selectedPOIsIds,
  });

  const moPaginatedList = useMemo(() => {
    if (fullDetailMOsResponse?.data) {
      const calculatedMoPaginatedList = fullDetailMOsResponse.data.map((mo) => {
        const calculatedWare = recalculateWare(mo.purchaseOrderItem?.ware)
        const calculatedPOI = recalculatePurchaseOrderItem({
          ...mo.purchaseOrderItem!,
          ware: calculatedWare
        })

        return {
          ...mo,
          purchaseOrderItem: calculatedPOI,
        }
      })
      return {
        data: calculatedMoPaginatedList
      }
    }
    else {
      return undefined
    }
  }, [fullDetailMOsResponse?.data])

  const tableData: MaterialRequirementDto[] = useMemo(() => accumulateMaterialRequirements(moPaginatedList?.data ?? [], props.type),
    [moPaginatedList, props.type]);

  const table = useReactTable({
    data: tableData,
    columns: materialRequirementColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.code,
  });

  if (check.undefined(moPaginatedList?.data) || moPaginatedList?.data.length < 1) {
    return (
      <Center>
        <Box bgColor={"gray.200"} px={3} py={2} rounded={"md"}>
          <Stack alignItems={"center"}>
            <Text>Các lệnh sẽ được tạo sẽ được hiển thị ở đây</Text>
            <Text>Hãy chọn PO Item bên trên</Text>
          </Stack>
        </Box>
      </Center>
    );
  }

  return (
    <Box mt={3} {...props.rootProps}>
      <Text textAlign={"center"} fontWeight={"bold"}>Trọng lượng giấy {props.type === "RAW" ? " mộc" : " mặt"}</Text>
      <Table.ScrollArea borderWidth="1px">
        <Table.Root
          minW={table.getTotalSize()}
          size="sm"
          variant={"outline"}
          showColumnBorder
          {...props.tableRootProps}
        >
          <Table.Header colorPalette={"blue"} bgColor={"colorPalette.muted"}>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Row key={headerGroup.id} h={"3rem"}>
                {headerGroup.headers.map((header) => (
                  <Table.ColumnHeader key={header.id}
                    colorPalette={"blue"} bgColor={"colorPalette.muted"}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </Table.ColumnHeader>
                ))}
              </Table.Row>
            ))}
          </Table.Header>
          <Table.Body>
            {table.getRowModel().rows.map((row) => (
              <Table.Row
                key={row.id}
                h={"3.2rem"}
                bg={"bg"}
              >
                {row.getVisibleCells().map((cell) => (
                  <Table.Cell
                    key={cell.id}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </Box >
  );
}
