import TestDataOutsideControlledInput from "@/components/debug-components/TestDataOutsideControlledInput";
import TestDataTable from "@/components/debug-components/TestDataTable";
import { TestDataTableQueryInput } from "@/components/debug-components/TestDataTableQueryInput";
import { DataTableProvider } from "@/components/ui/data-table/Provider";
import { Box, Text } from "@chakra-ui/react";

export default function Dashboard() {
  return (
    <Box
      m={5}
      p={2}
      flexGrow={1}
      boxSizing={"border-box"}
      rounded={"sm"}
      bg={"gray.200"}
    >
      <Text fontWeight={"semibold"} color={"blackAlpha.800"}>
        Dashboard
      </Text>
    </Box>
  );
}
