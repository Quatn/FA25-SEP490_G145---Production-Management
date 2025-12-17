"use client"

import { Box, Center, Container, GridItem, SimpleGrid, Stack, Text } from "@chakra-ui/react"
import PaperUsageChart from "./PaperUsageChart";
import PaperUsageTable from "./PaperUsageTable";

export type MaterialRequirementContainerProps = {
  children?: React.ReactNode;
}

export default function MaterialRequirementContainer(props: MaterialRequirementContainerProps) {
  // const { selectedManufacturingOrders } = useSelectedOrdersState();
  // 
  // if (check.undefined(selectedManufacturingOrders) || selectedManufacturingOrders.length < 1) {
  // return (
  // <Center>
  // <Box bgColor={"gray.200"} px={3} py={2} rounded={"md"}>
  // <Stack alignItems={"center"}>
  // <Text>Khối lượng của các nguyên phụ liệu được sử dụng sẽ được hiển thị ở đây</Text>
  // </Stack>
  // </Box>
  // </Center>
  // );
  // }

  return (
    <Container m={0}>
      <Box colorPalette={"gray"} bg={"colorPalette.subtle"} p={5} rounded={"md"} justifyContent={"stretch"}>
        <SimpleGrid columns={2} gap="40px">
          <GridItem colSpan={{ base: 1 }}>
            <PaperUsageTable type="FACE" header={"Trọng lượng giấy mặt"} />
          </GridItem>
          <GridItem colSpan={{ base: 1 }}>
            <PaperUsageTable type="RAW" header={"Trọng lượng giấy mộc"} />
          </GridItem>
          <GridItem colSpan={{ base: 1 }}>
            <Box bg="bg" p={2} pt={5} rounded={"md"} h="full">
              <PaperUsageChart type="FACE" />
            </Box>
          </GridItem>
          <GridItem colSpan={{ base: 1 }}>
            <Box bg="bg" p={2} pt={5} rounded={"md"} h="full">
              <PaperUsageChart type="RAW" />
            </Box>
          </GridItem>
        </SimpleGrid>
        {props.children}
      </Box>
    </Container>
  )
}
