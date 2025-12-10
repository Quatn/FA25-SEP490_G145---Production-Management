import { ManufacturingOrderMonthlyProductionBarChart } from "@/components/manufacturing-order/dashboard/monthly-production-chart/BarChart";
import { ManufacturingOrderMonthlyProductionBarChartMonthSelector } from "@/components/manufacturing-order/dashboard/monthly-production-chart/MonthSelector";
import { ManufacturingOrderStatusesPieChart } from "@/components/manufacturing-order/dashboard/quarterly-order-statuses-chart/PieChart";
import { ManufacturingOrderMonthlyProductionChartProvider } from "@/context/manufacturing-order/dashboard/manufacturingOrderMonthlyProductionChartContext";
import { Box, GridItem, Heading, HStack, SimpleGrid, Text } from "@chakra-ui/react";

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
      <SimpleGrid columns={{ md: 1, lg: 2 }} gap="40px" mx={5}>
        <GridItem colSpan={{ base: 1 }}>
        </GridItem>

        <GridItem colSpan={{ base: 1 }}>
          <Box bg="bg" p={2} rounded={"sm"}>
            <Heading size={"sm"}>Tổng quan trạng thái của các lệnh sản xuất theo quý</Heading>
            <ManufacturingOrderStatusesPieChart />
          </Box>
        </GridItem>

        <GridItem colSpan={{ base: 1, lg: 2 }}>
          <ManufacturingOrderMonthlyProductionChartProvider>
            <Box bg="bg" p={2} rounded={"sm"}>
              <HStack mb={5} justifyContent={"space-between"}>
                <Heading size={"sm"}>Số lượng lệnh sản xuất theo tháng</Heading>
                <ManufacturingOrderMonthlyProductionBarChartMonthSelector />
              </HStack>

              <ManufacturingOrderMonthlyProductionBarChart />
            </Box>
          </ManufacturingOrderMonthlyProductionChartProvider>
        </GridItem>

        <GridItem colSpan={{ base: 1 }}>
        </GridItem>
      </SimpleGrid>
    </Box>
  );
}
