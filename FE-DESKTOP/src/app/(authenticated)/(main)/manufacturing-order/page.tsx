import ManufacturingOrderDailyStatusesPieChartDateSelector from "@/components/manufacturing-order/dashboard/daily-order-statuses-chart/DateSelector";
import { ManufacturingOrderDailyStatusesPieChart } from "@/components/manufacturing-order/dashboard/daily-order-statuses-chart/PieChart";
import { ManufacturingOrderDailyProductionOutputChartBarList } from "@/components/manufacturing-order/dashboard/daily-production-output-chart/BarList";
import ManufacturingOrderDailyProductionOutputChartDateSelector from "@/components/manufacturing-order/dashboard/daily-production-output-chart/DateSelector";
import ManufacturingOrderOrderDetailsConfirmDialog from "@/components/manufacturing-order/order-details-dialog/ConfirmDialog";
import ManufacturingOrderDetailsDialog from "@/components/manufacturing-order/order-details-dialog/Dialog";
import { ManufacturingOrderTrackPanel } from "@/components/manufacturing-order/track-panel/components";
import { ManufacturingOrderDailyProductionOutputChartProvider } from "@/context/manufacturing-order/dashboard/manufacturingOrderDailyProductionOutputChartContext";
import { ManufacturingOrderDailyOrderStatusesChartProvider } from "@/context/manufacturing-order/dashboard/manufacturingOrderDailyStatusesPieChartContext";
import { ManufacturingOrderDialogProvider } from "@/context/manufacturing-order/manufacturingOrderDetailsDialogContent";
import { ManufacturingOrderTrackPanelListProvider } from "@/context/manufacturing-order/manufacturingOrderTrackPanelContext";
import { Box, GridItem, Heading, HStack, SimpleGrid } from "@chakra-ui/react";

export default function ManufacturingOrderDashboard() {
  return (
    <ManufacturingOrderTrackPanelListProvider>
      <ManufacturingOrderDialogProvider>
        <Box mt={5}>
          <Heading>Dashboard lệnh sản xuất</Heading>
        </Box>

        <SimpleGrid columns={{ md: 1, lg: 2 }} gap="40px" mx={5} mt={5} alignItems={"stretch"}>
          <GridItem colSpan={{ base: 1 }}>
            <ManufacturingOrderDailyProductionOutputChartProvider>
              <Box bg="bg.muted" p={2} rounded={"sm"} h={"full"}>
                <HStack mb={5} justifyContent={"space-between"}>
                  <Heading size={"sm"}>Tổng quan sản lượng của các khâu sản xuất theo ngày</Heading>
                  <ManufacturingOrderDailyProductionOutputChartDateSelector />
                </HStack>

                <ManufacturingOrderDailyProductionOutputChartBarList />
              </Box>
            </ManufacturingOrderDailyProductionOutputChartProvider>
          </GridItem>

          <GridItem colSpan={{ base: 1 }}>
            <ManufacturingOrderDailyOrderStatusesChartProvider>
              <Box bg="bg.muted" p={2} rounded={"sm"} h={"full"}>
                <HStack mb={5} justifyContent={"space-between"}>
                  <Heading size={"sm"}>Tổng quan trạng thái của các lệnh sản xuất theo ngày</Heading>
                  <ManufacturingOrderDailyStatusesPieChartDateSelector />
                </HStack>

                <ManufacturingOrderDailyStatusesPieChart />
              </Box>
            </ManufacturingOrderDailyOrderStatusesChartProvider>
          </GridItem>

          <GridItem colSpan={{ base: 1, lg: 2 }}>
            <ManufacturingOrderTrackPanel.Panel />
          </GridItem>
        </SimpleGrid>

        <ManufacturingOrderDetailsDialog />
        <ManufacturingOrderOrderDetailsConfirmDialog />
      </ManufacturingOrderDialogProvider>
    </ManufacturingOrderTrackPanelListProvider>
  );
}
