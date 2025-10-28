"use client";

import PurchaseOrderDetailStack from "@/components/purchase-order/PurchaseOrderDetailStack";
import { useGetPurchaseOrdersQuery } from "@/service/api/purchaseOrderApiSlice";
import { PurchaseOrder } from "@/types/PurchaseOrder";
import { Box, For, Stack, Text } from "@chakra-ui/react";
import check from "check-types";

export default function PurchaseOrderDetailedList() {
  const {
    data: rawOrders,
    error: queryErrors,
    isLoading: querying,
  } = useGetPurchaseOrdersQuery({ page: 1, limit: 20 });

  if (querying) {
    return <Text>Loading list</Text>;
  }

  if (queryErrors || check.undefined(rawOrders)) {
    return <Text>Error loading list</Text>;
  }

  const orders: PurchaseOrder[] = rawOrders.map((raw) => ({
    ...raw,
    orderDate: new Date(raw.orderDate),
  }));

  return (
    <Box m={5} p={2} rounded={"sm"} bg={"gray.200"}>
      <Stack ms={3}>
        <For each={orders}>
          {(order, index) => <PurchaseOrderDetailStack key={index} po={order} />}
        </For>
      </Stack>
    </Box>
  );
}
