import { Box, For, Stack, Table } from "@chakra-ui/react";
import ProductionOrderTable from "./ProductionOrderTable";
import SearchBar from "./SearchBar";

export default function ProductionOrderTablePage() {
  return (
    <Box m={5} p={4} rounded={"sm"} bg={"gray.200"}>
      <SearchBar />
      <ProductionOrderTable />
    </Box>
  );
}
