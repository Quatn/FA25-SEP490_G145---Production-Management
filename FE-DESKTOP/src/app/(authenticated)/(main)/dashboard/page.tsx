import ManufacturingOrderMonthlyDepartmentOutputsBarChart from "@/components/manufacturing-order/dashboard/monthly-department-ouputs-chart/BarChart";
import ManufacturingOrderMonthlyDepartmentOutputsBarChartMonthSelector from "@/components/manufacturing-order/dashboard/monthly-department-ouputs-chart/MonthSelector";
import ManufacturingOrderMonthlyStatusesPieChartMonthSelector from "@/components/manufacturing-order/dashboard/monthly-order-statuses-chart/MonthSelector";
import { ManufacturingOrderMonthlyStatusesPieChart } from "@/components/manufacturing-order/dashboard/monthly-order-statuses-chart/PieChart";
import ManufacturingOrderMonthlyProductionBarChart from "@/components/manufacturing-order/dashboard/monthly-production-chart/BarChart";
import ManufacturingOrderMonthlyProductionBarChartMonthSelector from "@/components/manufacturing-order/dashboard/monthly-production-chart/MonthSelector";
import { ManufacturingOrderMonthlyDepartmentOutputsChartProvider } from "@/context/manufacturing-order/dashboard/manufacturingOrderMonthlyDepartmentOutputsChartContext";
import { ManufacturingOrderMonthlyProductionChartProvider } from "@/context/manufacturing-order/dashboard/manufacturingOrderMonthlyProductionChartContext";
import { ManufacturingOrderMonthlyOrderStatusesChartProvider } from "@/context/manufacturing-order/dashboard/manufacturingOrderMonthlyStatusesPieChartContext";
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
          <ManufacturingOrderMonthlyOrderStatusesChartProvider>
            <Box bg="bg" p={2} rounded={"sm"}>
              <HStack mb={5} justifyContent={"space-between"}>
                <Heading size={"sm"}>Tổng quan trạng thái của các lệnh sản xuất theo tháng</Heading>
                <ManufacturingOrderMonthlyStatusesPieChartMonthSelector />
              </HStack>

              <ManufacturingOrderMonthlyStatusesPieChart />
            </Box>
          </ManufacturingOrderMonthlyOrderStatusesChartProvider>
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

        <GridItem colSpan={{ base: 1, lg: 2 }}>
          <ManufacturingOrderMonthlyDepartmentOutputsChartProvider>
            <Box bg="bg" p={2} rounded={"sm"}>
              <HStack mb={5} justifyContent={"space-between"}>
                <Heading size={"sm"}>Sản lượng các bộ phân gia công theo tháng</Heading>
                <ManufacturingOrderMonthlyDepartmentOutputsBarChartMonthSelector />
              </HStack>

              <ManufacturingOrderMonthlyDepartmentOutputsBarChart />
            </Box>
          </ManufacturingOrderMonthlyDepartmentOutputsChartProvider>
        </GridItem>

        <GridItem colSpan={{ base: 1 }}>
        </GridItem>
      </SimpleGrid>
    </Box>
  );
}
