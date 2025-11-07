"use client";

import { useGetWaresByCodesQuery } from "@/service/api/wareApiSlice";
import { Product } from "@/types/Product";
import { CheckboxCard, For, Text } from "@chakra-ui/react";

export type ProductSelectionBoxItemProps = {
  product: Product;
};

export default function ProductSelectionBoxItem(
  { product }: ProductSelectionBoxItemProps,
) {
  const {
    data: rawWare,
    error: queryErrors,
    isLoading: querying,
  } = useGetWaresByCodesQuery({ page: 1, limit: 20, codes: product.wareCodes });

  return (
    <CheckboxCard.Root>
      <CheckboxCard.HiddenInput />
      <CheckboxCard.Control>
        <CheckboxCard.Label>{product.name}</CheckboxCard.Label>
        <CheckboxCard.Indicator />
      </CheckboxCard.Control>
      <For each={rawWare}>{(ware) => <Text>{ware.code}</Text>}</For>
    </CheckboxCard.Root>
  );
}
