"use client";

import {
  useManufacturingPageDispatch,
  useManufacturingPageState,
} from "@/context/manufacturing-order/manufacturingOrderCreatePageContext";
import { useQueryOrdersWithUnmanufacturedItemsQuery } from "@/service/api/purchaseOrderApiSlice";
import { Button, Group, HStack, Skeleton, Stack, Text } from "@chakra-ui/react";
import check from "check-types";
import { CiWarning } from "react-icons/ci";
import PurchaseOrderItemSelectorItem from "./PurchaseOrderItemSelectorItem";

export default function PurchaseOrderItemSelector() {
  const { groupType, page, limit, search } = useManufacturingPageState();
  const dispatch = useManufacturingPageDispatch();

  const {
    data: queryResponse,
    error: fetchError,
    isLoading: isFetchingList,
  } = useQueryOrdersWithUnmanufacturedItemsQuery({ page, limit, search });

  const orderPaginatedList = queryResponse?.data;

  if (isFetchingList) {
    return <Skeleton width={"full"} height={"full"} />;
  }

  if (
    fetchError || queryResponse?.success == false ||
    !check.array(orderPaginatedList?.data)
  ) {
    return (
      <Stack py={4} alignItems={"center"}>
        <CiWarning color={"red"} size={"10rem"} />
        {fetchError && <Text>{JSON.stringify(fetchError)}</Text>}
      </Stack>
    );
  }

  return (
    <Stack>
      {orderPaginatedList.data.map((order) => (
        <PurchaseOrderItemSelectorItem
          key={order.purchaseOrder._id}
          po={order}
        />
      ))}
    </Stack>
  );
}
