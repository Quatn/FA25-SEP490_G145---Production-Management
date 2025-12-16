"use client";

import { MaterialRequirementDto } from "@/types/DTO/material-requirement-summary/MaterialRequirement";
import { Box, BoxProps, Center, Mark, Stack, Table, TableRootProps, TabsRootProps, Text } from "@chakra-ui/react";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo } from "react";
import check from "check-types";
import { ManufacturingOrder } from "@/types/ManufacturingOrder";
import { Ware } from "@/types/Ware";
import { PurchaseOrderItem } from "@/types/PurchaseOrderItem";
import { useGetDraftFullDetailManufacturingOrdersByPoiIdsQuery } from "@/service/api/manufacturingOrderApiSlice";
import { ManufacturingOrderCreatePageReducerStore } from "@/context/manufacturing-order/manufacturingOrderCreatePageContext";
import { paperUsageTableColumns } from "./paperUsageTableDefinition";
import { useGetInventoryByWarePaperTypeCodesQuery } from "@/service/api/paperRollApiSlice";
import DataFetchError from "@/components/common/DataFetchError";
import DataLoading from "@/components/common/DataLoading";

export type PaperUsageTableProps = {
  rootProps?: BoxProps;
  tabsRootProps?: TabsRootProps;
  tableRootProps?: TableRootProps;
  type: "FACE" | "RAW"
  header: string,
};

function accumulateMaterialRequirements(
  items: Serialized<ManufacturingOrder>[] | undefined,
  type?: "FACE" | "RAW"
): MaterialRequirementDto[] {
  if (check.undefined(items)) return []

  const requirementMap: Map<string, number> = new Map();

  const pois = items
    .filter(mo => check.nonEmptyObject(mo.purchaseOrderItem))
    .filter(poi => check.nonEmptyObject((poi.purchaseOrderItem as Serialized<PurchaseOrderItem>).ware))
    .map(mo => mo.purchaseOrderItem as Serialized<PurchaseOrderItem>)
  const wares = pois.map(poi => poi.ware)

  if (check.undefined(pois) || check.undefined(wares)) return []

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

  for (const poi of pois) {
    for (const pair of fields) {
      const code = (poi.ware as Serialized<Ware>)[pair.type] as string;
      const weight = poi[pair.weight];

      if (code && check.equal(code.split("/").length === 4, type === "FACE") && typeof weight === "number") {
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

export default function PaperUsageTable(
  props: PaperUsageTableProps,
) {
  const { useSelector } = ManufacturingOrderCreatePageReducerStore;
  const selectedPOIsIds = useSelector(s => s.selectedPOIsIds);

  const {
    data: fullDetailMOsResponse,
    error: fetchError,
    isLoading: isFetchingList,
    refetch: refetchDraft,
  } = useGetDraftFullDetailManufacturingOrdersByPoiIdsQuery({
    ids: selectedPOIsIds,
  });

  const tableData: MaterialRequirementDto[] = useMemo(() => accumulateMaterialRequirements(fullDetailMOsResponse?.data ?? [], props.type),
    [fullDetailMOsResponse, props.type]);

  const paperTypesList = tableData.map(mr => mr.code)

  const {
    data: paperrollsByTypeListResponse,
    error: paperrollsByTypeListFetchError,
    isLoading: paperrollsByTypeListIsFetchingList,
  } = useGetInventoryByWarePaperTypeCodesQuery({
    codes: paperTypesList,
  }, { skip: paperTypesList.length < 1 });

  if (paperrollsByTypeListResponse?.data) {
    paperrollsByTypeListResponse.data.forEach(fetchedRolls => {
      const f = tableData.find((tb) => tb.code === fetchedRolls.code)
      if (f) {
        f.inventoryWeight = fetchedRolls.weight
      }
    })
  }

  const table = useReactTable({
    data: tableData,
    columns: paperUsageTableColumns(props.header),
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.code,
  });

  if (isFetchingList || paperrollsByTypeListIsFetchingList) {
    return <DataLoading />
  }

  if (fetchError || paperrollsByTypeListFetchError) {
    return <DataFetchError refetch={refetchDraft} />
  }

  if (check.undefined(fullDetailMOsResponse?.data) || fullDetailMOsResponse?.data.length < 1) {
    return (
      <Center>
        <Box bgColor={"colorPalette.muted"} px={3} py={2} rounded={"md"}>
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
                    colSpan={header.colSpan}
                    textAlign={header.colSpan > 1 ? "center" : "start"}
                    textWrap={"wrap"}
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
                {row.getVisibleCells().map((cell) => {
                  const insufficient = row.original.inventoryWeight < row.original.requirementWeight
                  return (
                    <Table.Cell
                      key={cell.id}
                    >
                      {
                        cell.column.id === "status" ?
                          <Mark colorPalette={insufficient ? "red" : "green"} variant={insufficient ? "solid" : "subtle"}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</Mark>
                          : flexRender(cell.column.columnDef.cell, cell.getContext())
                      }
                    </Table.Cell>
                  )
                })}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </Box >
  );
}
