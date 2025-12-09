"use client"

import { Box, Center, Container, GridItem, SimpleGrid, Stack, Text } from "@chakra-ui/react"
import MaterialRequirement, { PaperTypesTableProps } from "./PaperTypesTable"
import { useSelectedOrdersState } from "../TabbedContainer";
import check from "check-types";
import PaperUsageChart from "./PaperUsageChart";
import { useGetAllByPaperTypesUsageQuery } from "@/service/api/manufacturingOrderApiSlice";
import { ManufacturingOrderCreatePageReducerStore } from "@/context/manufacturing-order/manufacturingOrderCreatePageContext";

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
      <Box colorPalette={"gray"} bg={"colorPalette.subtle"} p={5} rounded={"md"}>
        <SimpleGrid columns={2} gap="40px">
          <GridItem colSpan={{ base: 1 }}>
            <MaterialRequirement type="FACE" header={"Trọng lượng giấy mặt"} />
          </GridItem>
          <GridItem colSpan={{ base: 1 }}>
            <MaterialRequirement type="RAW" header={"Trọng lượng giấy mộc"} />
          </GridItem>
          <GridItem colSpan={{ base: 1 }}>
            <PaperUsageChart />
          </GridItem>
          <Box height="20" />
          <Box height="20" />
          <Box height="20" />
        </SimpleGrid>
        {props.children}
      </Box>
    </Container>
  )
}
