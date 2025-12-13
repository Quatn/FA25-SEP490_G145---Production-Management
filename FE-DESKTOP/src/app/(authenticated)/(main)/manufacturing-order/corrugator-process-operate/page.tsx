import { ManufacturingOrderCorrugatorOperatePageComponents } from "@/components/manufacturing-order/corrugator-process-operate/components";
import { ManufacturingOrderTableComponents } from "@/components/manufacturing-order/full-detail-table/components";
import ManufacturingOrderOrderDetailsConfirmDialog from "@/components/manufacturing-order/order-details-dialog/ConfirmDialog";
import { DataTableProvider } from "@/components/ui/data-table/Provider";
import { ManufacturingOrderCorrugatorProcessOperateProvider } from "@/context/manufacturing-order/manufacturingOrderCorrugatorProcessOperateContext";
import { ManufacturingOrderDialogProvider } from "@/context/manufacturing-order/manufacturingOrderDetailsDialogContent";
import { CorrugatorProcessStatus } from "@/types/enums/CorrugatorProcessStatus";
import { Box, Heading, Stack } from "@chakra-ui/react";

export default function ManufacturingOrderCorrugatorProcessOperate() {
  return (
    <Box>
      <ManufacturingOrderCorrugatorProcessOperateProvider>
        <ManufacturingOrderDialogProvider>
          <Box m={5}>
            <Heading size="2xl">Chi tiết quy trình sóng</Heading>
          </Box>

          <Box mt={5}>
            <ManufacturingOrderCorrugatorOperatePageComponents.CorrugatorLineSwitcher />
          </Box>

          <Stack my={5} mx={5} gap={5}>
            <Box p={3} rounded={"md"} bg={"bg.muted"}>
              <DataTableProvider initialState={{ allowEdit: true }}>
                <Stack>
                  <Heading size="md">Danh sách chạy</Heading>
                  <ManufacturingOrderCorrugatorOperatePageComponents.SearchBar />
                  <ManufacturingOrderCorrugatorOperatePageComponents.Table
                    dataVariant="RUNNING"
                    corrugatorProcessStatuses={[CorrugatorProcessStatus.RUNNING, CorrugatorProcessStatus.PAUSED]}
                    tableHeaderProps={{ colorPalette: "yellow", bgColor: "colorPalette.muted" }}
                    tableColumnHeaderProps={{ colorPalette: "yellow", bgColor: "colorPalette.muted" }}
                  />
                  <Box mt={3}>
                    <ManufacturingOrderCorrugatorOperatePageComponents.Pagination />
                  </Box>
                </Stack>
              </DataTableProvider>
            </Box>

            <Box p={3} rounded={"md"} bg={"bg.muted"}>
              <DataTableProvider initialState={{ allowEdit: true }}>
                <Stack>
                  <Heading size="md">Danh sách chờ</Heading>
                  <ManufacturingOrderCorrugatorOperatePageComponents.SearchBar />
                  <ManufacturingOrderCorrugatorOperatePageComponents.Table
                    dataVariant="WAITING"
                    corrugatorProcessStatuses={[CorrugatorProcessStatus.NOTSTARTED]}
                  />
                  <Box mt={3}>
                    <ManufacturingOrderCorrugatorOperatePageComponents.Pagination />
                  </Box>
                </Stack>
              </DataTableProvider>
            </Box>

            <Box p={3} rounded={"md"} bg={"bg.muted"}>
              <DataTableProvider initialState={{ allowEdit: false }}>
                <Stack>
                  <Heading size="md">Lịch sử</Heading>
                  <ManufacturingOrderCorrugatorOperatePageComponents.SearchBar />
                  <ManufacturingOrderCorrugatorOperatePageComponents.Table
                    dataVariant="HISTORY"
                    corrugatorProcessStatuses={[CorrugatorProcessStatus.COMPLETED, CorrugatorProcessStatus.OVERCOMPLETED, CorrugatorProcessStatus.CANCELLED]}
                    tableHeaderProps={{ colorPalette: "gray", bgColor: "colorPalette.muted" }}
                    tableColumnHeaderProps={{ colorPalette: "gray", bgColor: "colorPalette.muted" }}
                  />
                  <Box mt={3}>
                    <ManufacturingOrderCorrugatorOperatePageComponents.Pagination />
                  </Box>
                </Stack>
              </DataTableProvider>
            </Box>
          </Stack>

          <ManufacturingOrderCorrugatorOperatePageComponents.ConfirmDialog />
          <ManufacturingOrderTableComponents.DetailsDialog />
          <ManufacturingOrderOrderDetailsConfirmDialog />
        </ManufacturingOrderDialogProvider>
      </ManufacturingOrderCorrugatorProcessOperateProvider>
    </Box>
  );
}
