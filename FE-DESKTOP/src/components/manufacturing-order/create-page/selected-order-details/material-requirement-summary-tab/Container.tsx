import { Box, Center, Container, GridItem, SimpleGrid, Stack, Text } from "@chakra-ui/react"
import MaterialRequirementTable, { MaterialRequirementTableProps } from "./MaterialTable"
import { useSelectedOrdersState } from "../TabbedContainer";
import check from "check-types";

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
            <MaterialRequirementTable type="FACE" header={"Trọng lượng giấy mặt"} />
          </GridItem>
          <GridItem colSpan={{ base: 1 }}>
            <MaterialRequirementTable type="RAW" header={"Trọng lượng giấy mộc"} />
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
