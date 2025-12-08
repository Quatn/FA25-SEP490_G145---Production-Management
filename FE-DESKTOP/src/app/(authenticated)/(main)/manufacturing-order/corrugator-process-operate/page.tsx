import { ManufacturingOrderCorrugatorOperatePageComponents } from "@/components/manufacturing-order/corrugator-process-operate/components";
import ManufacturingOrderOrderDetailsConfirmDialog from "@/components/manufacturing-order/order-details-dialog/ConfirmDialog";
import { DataTableProvider } from "@/components/ui/data-table/Provider";
import { ManufacturingOrderCorrugatorProcessOperateProvider } from "@/context/manufacturing-order/manufacturingOrderCorrugatorProcessOperateContext";
import { ManufacturingOrderDialogProvider } from "@/context/manufacturing-order/manufacturingOrderDetailsDialogContent";
import { CorrugatorProcessStatus } from "@/types/enums/CorrugatorProcessStatus";
import { Box, Heading } from "@chakra-ui/react";

export default function ManufacturingOrderCorrugatorProcessOperate() {
  return (
    <ManufacturingOrderCorrugatorProcessOperateProvider>
      <ManufacturingOrderDialogProvider>
        <Box mt={5}>
          <Heading size="2xl">Chi tiết quy trình sóng</Heading>
        </Box>

        <ManufacturingOrderCorrugatorOperatePageComponents.CorrugatorLineSwitcher />

        <Box mt={5}>
          <Box mt={5}>
            <DataTableProvider initialState={{ allowEdit: true }}>
              <Heading size="md">Danh sách chạy</Heading>
              <ManufacturingOrderCorrugatorOperatePageComponents.Table corrugatorProcessStatuses={[CorrugatorProcessStatus.RUNNING, CorrugatorProcessStatus.PAUSED]} />
            </DataTableProvider>
          </Box>

          <Box mt={5}>
            <DataTableProvider initialState={{ allowEdit: true }}>
              <Heading size="md">Danh sách chờ</Heading>
              <ManufacturingOrderCorrugatorOperatePageComponents.Table corrugatorProcessStatuses={[CorrugatorProcessStatus.NOTSTARTED]} />
            </DataTableProvider>
          </Box>

          <Box mt={5}>
            <DataTableProvider initialState={{ allowEdit: true }}>
              <Heading size="md">Lịch sử</Heading>
              <ManufacturingOrderCorrugatorOperatePageComponents.Table corrugatorProcessStatuses={[CorrugatorProcessStatus.COMPLETED, CorrugatorProcessStatus.OVERCOMPLETED, CorrugatorProcessStatus.CANCELLED]} />
            </DataTableProvider>
          </Box>
        </Box>

        <ManufacturingOrderCorrugatorOperatePageComponents.ConfirmDialog />
        <ManufacturingOrderOrderDetailsConfirmDialog />
      </ManufacturingOrderDialogProvider>
    </ManufacturingOrderCorrugatorProcessOperateProvider>
  );
}
