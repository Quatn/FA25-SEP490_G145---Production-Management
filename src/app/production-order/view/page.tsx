import ProductionOrderTable from "@/components/production-order/ProductionOrderTable";
import SearchBar from "@/components/production-order/SearchBar";
import { Box, For, Stack, Table } from "@chakra-ui/react";

export default function ProductionOrderTablePage() {
  return (
    <Box m={5} p={4} rounded={"sm"} bg={"gray.200"}>
      <SearchBar />
      <ProductionOrderTable />
    </Box>
  );
}
