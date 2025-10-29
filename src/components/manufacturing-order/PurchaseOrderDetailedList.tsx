"use client";

import PurchaseOrderDetailStack from "@/components/purchase-order/PurchaseOrderDetailStack";
import { useGetPurchaseOrdersQuery } from "@/service/api/purchaseOrderApiSlice";
import { PurchaseOrder } from "@/types/PurchaseOrder";
import { Box, For, Stack, Text } from "@chakra-ui/react";
import check from "check-types";

export default function PurchaseOrderDetailedList() {
  const {
    data: orderPaginatedResponse,
    error: queryErrors,
    isLoading: querying,
  } = useGetPurchaseOrdersQuery({ page: 1, limit: 20 });

  const orders: PurchaseOrder[] | undefined = orderPaginatedResponse?.data.map((
    raw,
  ) => ({
    ...raw,
    orderDate: new Date(raw.orderDate),
  }));

  if (querying) {
    return <Text>Loading list</Text>;
  }

  if (queryErrors || check.undefined(orderPaginatedResponse)) {
    return <Text>Error loading list</Text>;
  }

  return (
    <Box m={5} p={2} rounded={"sm"} bg={"gray.200"}>
      <Stack ms={3}>
        <For each={orders}>
          {(order) => <PurchaseOrderDetailStack po={order} />}
        </For>
      </Stack>
    </Box>
  );
}
