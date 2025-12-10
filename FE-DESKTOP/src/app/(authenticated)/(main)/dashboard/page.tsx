import { Box, GridItem, SimpleGrid, Text } from "@chakra-ui/react";

export default function Dashboard() {
  return (
    <Box
      m={5}
      p={2}
      flexGrow={1}
      boxSizing={"border-box"}
      rounded={"sm"}
      colorPalette={"gray"}
      backgroundColor={"colorPalette.subtle"}
    >
      <Text fontWeight={"semibold"} color={"fg"}>
        Dashboard
      </Text>
        <SimpleGrid columns={{md: 1, lg: 2}} gap="40px" mx={5}>
          <GridItem colSpan={{ base: 1 }}>
          </GridItem>
          <GridItem colSpan={{ base: 1 }}>
            <Box bg="bg" p={2} pt={5} rounded={"sm"}>
            </Box>
          </GridItem>
          <GridItem colSpan={{ base: 1 }}>
          </GridItem>
          <GridItem colSpan={{ base: 1 }}>
          </GridItem>
        </SimpleGrid>
    </Box>
  );
}
