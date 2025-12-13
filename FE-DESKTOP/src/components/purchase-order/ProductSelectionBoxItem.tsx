"use client";

import { useGetWaresByCodesQuery } from "@/service/api/wareApiSlice";
import { Product } from "@/types/Product";
import { Ware } from "@/types/Ware";
import { CheckboxCard, For, Text } from "@chakra-ui/react";
import check from "check-types";

export type ProductSelectionBoxItemProps = {
  product: Product;
};

export default function ProductSelectionBoxItem(
  { product }: ProductSelectionBoxItemProps,
) {
  const {
    data: warePaginatedResponse,
    error: queryErrors,
    isLoading: querying,
  } = useGetWaresByCodesQuery({ page: 1, limit: 20, codes: product.wareCodes });

  const wares: Ware[] | undefined = warePaginatedResponse?.data;

  if (querying) {
    return <Text>Loading list</Text>;
  }

  if (queryErrors || check.undefined(wares)) {
    return <Text>Error loading list</Text>;
  }

  return (
    <CheckboxCard.Root>
      <CheckboxCard.HiddenInput />
      <CheckboxCard.Control>
        <CheckboxCard.Label>{product.name}</CheckboxCard.Label>
        <CheckboxCard.Indicator />
      </CheckboxCard.Control>
      <For each={wares}>{(ware) => <Text>{ware.code}</Text>}</For>
    </CheckboxCard.Root>
  );
}
