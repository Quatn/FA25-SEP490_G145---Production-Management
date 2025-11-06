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
