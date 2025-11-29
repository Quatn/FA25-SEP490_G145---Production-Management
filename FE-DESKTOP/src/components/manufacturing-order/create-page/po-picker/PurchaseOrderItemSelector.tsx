"use client";

import {
  ManufacturingOrderCreatePageReducerStore,
  ManufacturingOrderCreatePageTreeNode,
} from "@/context/manufacturing-order/manufacturingOrderCreatePageContext";
import { useQueryOrdersWithUnmanufacturedItemsQuery } from "@/service/api/purchaseOrderApiSlice";
import {
  Box,
  Button,
  Center,
  Group,
  HStack,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react";
import check from "check-types";
import { CiWarning } from "react-icons/ci";
import PurchaseOrderItemSelectorItem from "./PurchaseOrderItemSelectorItem";
import Link from "next/link";
import { RiFolderOpenLine } from "react-icons/ri";
import { useMemo } from "react";

export default function PurchaseOrderItemSelector() {
  const { useSelector, useDispatch } = ManufacturingOrderCreatePageReducerStore;
  // const dispatch = useDispatch();
  const page = useSelector(s => s.page);
  const limit = useSelector(s => s.limit);
  const search = useSelector(s => s.search);

  const {
    data: queryResponse,
    error: fetchError,
    isLoading: isFetchingList,
  } = useQueryOrdersWithUnmanufacturedItemsQuery({ page, limit, search });

  const orderPaginatedList = queryResponse?.data;

  const treeStructure: ManufacturingOrderCreatePageTreeNode[] | undefined =
    useMemo(() => {
      return orderPaginatedList?.data.map((po) => {
        return {
          id: po.purchaseOrder._id,
          name: po.purchaseOrder.code,
          children: po.subPurchaseOrders.map((subpo) => {
            return {
              id: subpo.subPurchaseOrder._id,
              name: subpo.subPurchaseOrder.code,
              children: subpo.purchaseOrderItems.filter(poi => !poi.isManufactured).map((poi) => {
                return {
                  id: poi._id,
                  name: poi.code,
                  isPOI: true,
                };
              }),
            };
          }),
        };
      });
    }, [orderPaginatedList]);

  if (isFetchingList) {
    return <Skeleton width={"full"} height={"full"} />;
  }

  if (
    fetchError || !(queryResponse?.success == true) ||
    !check.array(orderPaginatedList?.data) || check.undefined(treeStructure)
  ) {
    return (
      <Center py={4} flexGrow={1}>
        <Stack>
          <CiWarning color={"red"} size={"10rem"} />
          {fetchError && <Text>{JSON.stringify(fetchError)}</Text>}
        </Stack>
      </Center>
    );
  }

  const poCount = orderPaginatedList.data.length;

  if (poCount < 1) {
    return (
      <Center py={4} flexGrow={1}>
        <Stack alignItems={"center"}>
          <RiFolderOpenLine color={"gray"} size={"10rem"} />
          <Text textAlign={"center"}>
            {check.nonEmptyString(search)
              ? "Tất cả PO bị ẩn đi bởi bộ lọc"
              : "Không có PO nào chưa có lệnh sản xuất"}
          </Text>
          <Link href="/purchase-order/create">
            <Center>
              <Button colorPalette={"cyan"} size={"sm"}>Tạo PO</Button>
            </Center>
          </Link>
        </Stack>
      </Center>
    );
  }

  const poisCount = orderPaginatedList.data.map((po) =>
    po.manufacturedItemCount + po.unmanufacturedItemCount
  ).reduce((acc, i) => acc + i, 0);
  const unmannufacturedPoisCount = orderPaginatedList.data.map((po) =>
    po.unmanufacturedItemCount
  ).reduce((acc, i) => acc + i, 0);

  return (
    <Box>
      <Text>
        Đang hiển thị {poCount} PO, trong đó bao gồm {poisCount} PO Item,{" "}
        {unmannufacturedPoisCount} trong số đó chưa có lệnh sản xuất
      </Text>
      <Stack>
        {orderPaginatedList.data.map((order) => (
          <PurchaseOrderItemSelectorItem
            key={order.purchaseOrder._id}
            po={order}
            tree={treeStructure}
          />
        ))}
      </Stack>
    </Box>
  );
}
