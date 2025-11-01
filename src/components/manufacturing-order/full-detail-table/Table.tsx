"use client";

import {
  ManufacturingTableTabType,
  useManufacturingTableDispatch,
  useManufacturingTableState,
} from "@/context/manufacturing-order/manufacturingOrderTableContext";
import {
  useGetFullDetailManufacturingOrdersQuery,
  useGetManufacturingOrdersQuery,
} from "@/service/api/manufacturingOrderApiSlice";
import { FullDetailManufacturingOrderDTO } from "@/types/DTO/FullDetailManufactureOrder";
import { ManufacturingOrder } from "@/types/ManufacturingOrder";
import { formatDateToDDMMYYYY } from "@/utils/dateUtils";
import {
  Button,
  CloseButton,
  Dialog,
  Field,
  Input,
  Portal,
  Stack,
  Table,
  Tabs,
  TabsRootProps,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import check, { number } from "check-types";
import { useMemo, useState } from "react";
import { LuFolder, LuSquareCheck, LuUser } from "react-icons/lu";
import { manufacturingOrderTableColumnsByTabs } from "./tableDefinition";
import { useOptionalManufacturingDialogDispatch } from "@/context/manufacturing-order/manufacturingOrderDetailsDialogContent";

export type ManufacturingOrderTableProps = {
  rootProps?: TabsRootProps;
};

export default function ManufacturingOrderTable(
  props: ManufacturingOrderTableProps,
) {
  const {
    data: fullDetailMOPaginatedResponse,
    error: fetchError,
    isLoading: isFetchingList,
  } = useGetFullDetailManufacturingOrdersQuery({ page: 1, limit: 20 });

  const { tab, hoveredRowId, selectedOrderId, pinnedOrderIds } =
    useManufacturingTableState();
  const dispatch = useManufacturingTableDispatch();

  const dialogDispatch = useOptionalManufacturingDialogDispatch();

  const columnsForTab = manufacturingOrderTableColumnsByTabs[tab] ?? [];

  const moList = fullDetailMOPaginatedResponse?.data;

  const { open, onOpen, onClose } = useDisclosure();

  const selectedOrder: Serialized<FullDetailManufacturingOrderDTO> | null =
    useMemo(() => {
      const mo = moList?.find((mo) => mo.id === selectedOrderId);
      return check.undefined(mo) ? null : mo;
    }, [moList, selectedOrderId]);

  const handleViewDetailsClick = (id: string | null) => {
    dispatch({ type: "SET_SELECTED_ORDER_ID", payload: id });
    onOpen();
  };

  if (isFetchingList) {
    return <Text>Loading table</Text>;
  }

  if (fetchError) {
    return <Text>{JSON.stringify(fetchError)}</Text>;
  }

  if (check.undefined(moList)) {
    return <Text>Unable to load table</Text>;
  }

  return (
    <Tabs.Root
      value={tab}
      onValueChange={(e) =>
        dispatch({
          type: "SET_TAB",
          payload: e.value as ManufacturingTableTabType,
        })}
      mt={3}
      {...props.rootProps}
    >
      <Tabs.List ms="200px">
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
      </Tabs.List>{" "}
      <Table.Root
        size="sm"
        variant={"outline"}
        borderWidth={1}
        borderColor={"gray"}
        showColumnBorder
      >
        <Table.Header bgColor={"blue.100"}>
          <Table.Row h="60px">
            <Table.ColumnHeader w="100px">KH Giao</Table.ColumnHeader>
            <Table.ColumnHeader w="100px" borderEnd={"3px solid #66b5cf"}>
              Mã lệnh
            </Table.ColumnHeader>
            {columnsForTab.map((col) => (
              <Table.ColumnHeader key={col.key}>
                {col.header}
              </Table.ColumnHeader>
            ))}

            <Table.ColumnHeader w="120px" border="none" />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {moList.map((item) => (
            <Table.Row
              key={item.id}
              bg={"gray.50"}
              h="50px"
              onMouseEnter={() =>
                dispatch({ type: "SET_HOVERED_ROW_ID", payload: item.id })}
              onMouseLeave={() =>
                dispatch({ type: "SET_HOVERED_ROW_ID", payload: null })}
            >
              <Table.Cell>{item.manufacturingDirective}</Table.Cell>
              <Table.Cell borderEnd={"3px solid #66b5cf"}>
                {item.code}
              </Table.Cell>
              {columnsForTab.map((col) => (
                <Table.Cell key={col.key}>{col.render(item)}</Table.Cell>
              ))}
              <Table.Cell
                w="120px"
                border="none"
                bg="none"
              >
                {hoveredRowId === item.id && (
                  <>
                    {dialogDispatch &&
                      (
                        <Button
                          size="xs"
                          colorPalette={"blue"}
                          onClick={() =>
                            dialogDispatch({
                              type: "OPEN_DIALOG_WITH_ORDER",
                              payload: item,
                            })}
                        >
                          Chi tiết
                        </Button>
                      )}
                  </>
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Tabs.Root>
  );
}
