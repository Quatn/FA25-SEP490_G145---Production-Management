"use client";

import { ManufacturingOrderCreatePageReducerStore } from "@/context/manufacturing-order/manufacturingOrderCreatePageContext";
import {
  Box,
  BoxProps,
  Button,
  Center,
  HStack,
  Spinner,
  Stack,
  Table,
  TableRootProps,
  Tabs,
  TabsRootProps,
  Text,
} from "@chakra-ui/react";
import { CSSProperties, useContext, useMemo, useState } from "react";
import { LuFolder, LuSquareCheck, LuUser } from "react-icons/lu";
import { ManufacturingTableTabType } from "@/context/manufacturing-order/manufacturingOrderTableContext";
import { useCreateManyManufacturingOrdersMutation, useGetDraftFullDetailManufacturingOrdersByPoiIdsQuery } from "@/service/api/manufacturingOrderApiSlice";
import check from "check-types";
import { CreateManyManufacturingOrdersRequestDto } from "@/types/DTO/manufacturing-order/CreateManyManufacturingOrdersDto";
import { getCoreRowModel } from "@tanstack/react-table";
import { toaster } from "@/components/ui/toaster";
import { tryGetApiErrorMsg } from "@/utils/tryGetApiErrorMsg";
import { manufacturingOrderColumnsByTabs, manufacturingOrderMergedHeaders, ManufacturingOrderTableDataType } from "@/components/manufacturing-order/full-detail-table/tableDefinition";
import DataFetchError from "@/components/common/DataFetchError";
import { PurchaseOrderItem } from "@/types/PurchaseOrderItem";
import useDataTable from "@/components/ui/data-table/hook";
import { CreatePageStoreContext } from "../TabbedContainer";
import { useStore } from "@tanstack/react-store";
import { Ware } from "@/types/Ware";
import { productionModuleConfigs } from "@/config/production-module.config";

type TableProps = {
  rootProps?: BoxProps;
  tabsRootProps?: TabsRootProps;
  tableRootProps?: TableRootProps;
};

export default function CreatePageManufacturingOrderTable(
  props: TableProps,
) {
  const { useSelector, useDispatch } = ManufacturingOrderCreatePageReducerStore;
  const dispatch = useDispatch();
  const selectedPOIsIds = useSelector(s => s.selectedPOIsIds);

  const [tab, setTab] = useState<ManufacturingTableTabType>("all");
  const columnsForTab = manufacturingOrderColumnsByTabs[tab] ?? [];

  const store = useContext(CreatePageStoreContext);
  if (!store) throw new Error("Must be used inside CreatePageStoreContext");
  const draftedMOs = useStore(store, (s) => s.draftedMOs)
  const paperUsageChartData = useStore(store, (s) => s.paperUsageChartData)

  const rawTableData: (Omit<ManufacturingOrderTableDataType, "isEdited">)[] = draftedMOs ?? []

  const { table, tableComponent, tableData } = useDataTable({
    data: rawTableData,
    columns: columnsForTab.filter((r) => !check.in(r.id, ["orderStatusDisplay", "actions-column"])).filter((r) => r.id !== "actions-column"),
    getCoreRowModel: getCoreRowModel(),
    getRowId: (mo) => mo._id,
    bodyPropsStack: {
      tableRowProps: {
        bg: { base: "bg", _hover: "bg.muted" }
      },
      pinnedCellProps: {
        bg: "bg.subtle",
      },
      editedRowProps: {
        colorPalette: "yellow",
        bg: { base: "colorPalette.subtle", _hover: "colorPalette.muted" }
      },
      editedRowPinnedCellProps: {
        colorPalette: "yellow",
        bg: { base: "colorPalette.muted" }
      },
    },
    mergedHeadersIds: manufacturingOrderMergedHeaders,
    initialState: {
      columnPinning: {
        left: ['manufacturingDirective', "code"],
        right: ['actions-column'],
      },
    },
  });

  const [createOrders] = useCreateManyManufacturingOrdersMutation();

  // const { selectedManufacturingOrders } = useSelectedOrdersState();

  if (check.undefined(selectedPOIsIds) || selectedPOIsIds.length < 1) {
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

  // const fullDetailMOsResponse?.data = selectedManufacturingOrders;

  /*
  if (isFetchingList) {
    return (
      <Center h={"full"} flex={1} flexGrow={1}>
        <Stack alignItems={"center"}>
          <Spinner size="xl" />
          <Text>Đang tải lệnh</Text>
        </Stack>
      </Center>
    );
  }
  */

  /*
  if (fetchError) {
    return <DataFetchError h={"full"} flexGrow={1} />;
  }
  */

  if (check.undefined(draftedMOs)) {
    return <DataFetchError h={"full"} flexGrow={1} />;
  }

  function handleEditOrder(
    orders: CreateManyManufacturingOrdersRequestDto["orders"],
    id: string,
    field: keyof Omit<CreateManyManufacturingOrdersRequestDto["orders"][number], "purchaseOrderItemId">,
    value: string
  ): CreateManyManufacturingOrdersRequestDto["orders"] {
    return orders.map(order => {
      if (order.purchaseOrderItemId === id) {
        return {
          ...order,
          [field]: value,
        };
      }
      return order;
    });
  }

  const handleCreateOrder = () => {
    const formValue: CreateManyManufacturingOrdersRequestDto = {
      orders: tableData.filter(order => check.nonEmptyObject(order.purchaseOrderItem)).map((order) => ({
        purchaseOrderItemId: (order.purchaseOrderItem as Serialized<PurchaseOrderItem>)._id,
        corrugatorLineAdjustment: order.corrugatorLineAdjustment ?? null,
        manufacturingDirective: order.manufacturingDirective ?? null,
        amount: order.amount,
        note: order.note,
        manufacturingDateAdjustment: order.manufacturingDateAdjustment,
        requestedDatetime: order.requestedDatetime,
      }))
    }

    dispatch({
      type: "SET_PREPARED_SUBMIT_ASK_TEXT",
      payload: `Xác nhận tạo ${formValue.orders.length} lệnh?`
    });

    const accumulatedCalc = paperUsageChartData.data.at(-1)
    if (accumulatedCalc) {
      const requirementMap: Map<string, number> = new Map();

      const pois = draftedMOs
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

          if (code && typeof weight === "number") {
            const current = requirementMap.get(code) || 0;
            requirementMap.set(code, current + weight);
          }
        }
      }

      const insufficientPaperTypes: { type: string, missingAmount: number }[] = []

      Object.keys(accumulatedCalc).forEach((f) => {
        if (check.number(accumulatedCalc[f]) && check.less(accumulatedCalc[f], requirementMap.get(f) as number)) {
          insufficientPaperTypes.push({ type: f, missingAmount: (requirementMap.get(f) as number) - accumulatedCalc[f] })
        }
      });

      dispatch({ type: "SET_INSUFFICIENT_PAPER_TYPES", payload: insufficientPaperTypes })

      const currentDate = new Date()

      const insufficientOrderBufferTimes = tableData.filter(order => check.nonEmptyObject(order.purchaseOrderItem))
        .map((order) => {
          const adjusted = new Date(order.manufacturingDateAdjustment ?? "---")
          return {
            code: order.code,
            date: (check.string(order.manufacturingDateAdjustment) && check.date(adjusted)) ? adjusted : new Date(order.manufacturingDate)
          }
        })
        .filter(order => (order.date.getTime() - currentDate.getTime()) < productionModuleConfigs.MIN_SCHEDULE_TIME_MS_DISTANCE_ALLOWED_FOR_UNFULFILLED_MATERIAL_REQUIREMENTS)

      dispatch({ type: "SET_INSUFFICIENT_ORDER_BUFFER_TIMES", payload: insufficientOrderBufferTimes })
    }

    dispatch({
      type: "SET_PREPARED_SUBMIT_FUNCTION", payload: () => {
        createOrders(formValue).unwrap().then((res) => {
          if (check.greaterOrEqual(res.data?.createdAmount as number, res.data?.createdAmount as number)) {
            toaster.success({
              title: "Success",
              description: "All orders created successfully",
            })
          }
          else if (check.greaterOrEqual(res.data?.createdAmount as number, 1)) {
            toaster.warning({
              title: "Some orders was not created",
            })
          }
          else {
            toaster.warning({
              title: "No orders created",
            })
          }
          dispatch({ type: "RESET_TREE_STATE" })
        }).catch(error => {
          toaster.warning({
            title: "Error creating order",
            description: tryGetApiErrorMsg(error),
          })
        })
      }
    })
  }

  const getTabBarOffset = () => {
    try {
      return (table.getColumn("code")?.getStart("left") ?? 0) + (table.getColumn("code")?.getSize() ?? 0);
    }
    catch {
      return 0
    }
  }

  return (
    <Box mt={3} {...props.rootProps}>
      <Tabs.Root
        value={tab}
        onValueChange={(e) => setTab(e.value as ManufacturingTableTabType)}
        {...props.tabsRootProps}
      >
        <Tabs.List ms={`${getTabBarOffset()}px`}>
          <Tabs.Trigger value="all">
            <LuUser />
            Tổng quan
          </Tabs.Trigger>
          <Tabs.Trigger value="order">
            <LuUser />
            Thông tin đơn hàng
          </Tabs.Trigger>
          <Tabs.Trigger value="manufacture">
            <LuFolder />
            Gia công
          </Tabs.Trigger>
          <Tabs.Trigger value="layers">
            <LuSquareCheck />
            Cấu trúc lớp
          </Tabs.Trigger>
          <Tabs.Trigger value="notes">
            <LuSquareCheck />
            Ghi chú
          </Tabs.Trigger>
          <Tabs.Trigger value="weight">
            <LuSquareCheck />
            Trọng lượng giấy sử dụng
          </Tabs.Trigger>
          <Tabs.Trigger value="processes">
            <LuSquareCheck />
            Công đoạn hoàn thiện
          </Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>

      <Table.ScrollArea borderWidth="1px">
        {tableComponent}
      </Table.ScrollArea>

      <HStack my={3} justifyContent={"end"}>
        <Button colorPalette={"blue"} onClick={handleCreateOrder}>Tạo {selectedPOIsIds.length} lệnh</Button>
        <Button colorPalette={"red"}>Đặt lại</Button>
      </HStack>
    </Box>
  );
}
