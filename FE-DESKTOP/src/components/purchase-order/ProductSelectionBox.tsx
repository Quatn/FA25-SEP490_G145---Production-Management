"use client";

import { useGetProductsQuery } from "@/service/api/productApiSlice";
import { Product } from "@/types/Product";
import { Box, For, Stack, Text } from "@chakra-ui/react";
import check from "check-types";
import ProductSelectionBoxItem from "./ProductSelectionBoxItem";

export default function ProductSelectionBox() {
  const {
    data: productPaginatedResponse,
    error: queryErrors,
    isLoading: querying,
  } = useGetProductsQuery({ page: 1, limit: 20 });

  const products: Product[] | undefined = productPaginatedResponse?.data;

  if (querying) {
    return <Text>Loading list</Text>;
  }

  if (queryErrors || check.undefined(products)) {
    return <Text>Error loading list</Text>;
  }

  return (
    <Box>
      <Stack ms={3}>
        <For each={products}>
          {(product) => <ProductSelectionBoxItem product={product} />}
        </For>
      </Stack>
    </Box>
  );
}
