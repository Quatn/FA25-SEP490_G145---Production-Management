"use client";

import { useGetProductionOrdersQuery } from "@/service/api/productionOrderApiSlice";
import { Table, Text } from "@chakra-ui/react";
import check from "check-types";

export default function ProductionOrderTable() {
  const {
    data: productionOrderListQuery,
    error: fetchError,
    isLoading: isFetchingList,
  } = useGetProductionOrdersQuery({ page: 1, limit: 20 });

  const productionOrderList = productionOrderListQuery?.productionOrders;

  if (isFetchingList) {
    return <Text>Loading table</Text>;
  }

  if (fetchError) {
    return <Text>Error loading table</Text>;
  }

  if (check.undefined(productionOrderList)) {
    return <Text>Unable to load table</Text>;
  }

  return (
    <Table.Root
      size="sm"
      variant={"outline"}
      borderWidth={1}
      borderColor={"gray"}
    >
      <Table.Header bgColor={"blue.100"}>
        <Table.Row>
          <Table.ColumnHeader>Id</Table.ColumnHeader>
          <Table.ColumnHeader>Production Order Code</Table.ColumnHeader>
          <Table.ColumnHeader>Customer</Table.ColumnHeader>
          <Table.ColumnHeader>Ware Code</Table.ColumnHeader>
          <Table.ColumnHeader>Wave Type</Table.ColumnHeader>
          <Table.ColumnHeader>Length</Table.ColumnHeader>
          <Table.ColumnHeader>Width</Table.ColumnHeader>
          <Table.ColumnHeader>Height</Table.ColumnHeader>
          <Table.ColumnHeader>Excess Inventory</Table.ColumnHeader>
          <Table.ColumnHeader>Amount</Table.ColumnHeader>
          <Table.ColumnHeader>Order Received Date</Table.ColumnHeader>
          <Table.ColumnHeader>Delivery Date</Table.ColumnHeader>
          <Table.ColumnHeader textAlign={"end"}>
            Purchase Order
          </Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {productionOrderList.map((item) => (
          <Table.Row key={item.id} bg={"gray.50"}>
            <Table.Cell>{item.id}</Table.Cell>
            <Table.Cell>{item.productionOrderCode}</Table.Cell>
            <Table.Cell>{item.customer}</Table.Cell>
            <Table.Cell>{item.wareCode}</Table.Cell>
            <Table.Cell>{item.waveType}</Table.Cell>
            <Table.Cell>{item.length}</Table.Cell>
            <Table.Cell>{item.width}</Table.Cell>
            <Table.Cell>{item.height}</Table.Cell>
            <Table.Cell>{item.excessInventory}</Table.Cell>
            <Table.Cell>{item.amount}</Table.Cell>
            <Table.Cell>{item.orderReceivedDate}</Table.Cell>
            <Table.Cell>{item.deliveryDate}</Table.Cell>
            <Table.Cell textAlign={"end"}>{item.purchaseOrder}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
