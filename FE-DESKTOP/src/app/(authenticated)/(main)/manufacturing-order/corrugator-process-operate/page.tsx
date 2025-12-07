import { ManufacturingOrderCorrugatorOperatePageComponents } from "@/components/manufacturing-order/corrugator-process-operate/components";
import ManufacturingOrderOrderDetailsConfirmDialog from "@/components/manufacturing-order/order-details-dialog/ConfirmDialog";
import ManufacturingOrderDetailsDialog from "@/components/manufacturing-order/order-details-dialog/Dialog";
import { DataTableProvider } from "@/components/ui/data-table/Provider";
import { ManufacturingOrderCorrugatorProcessOperateProvider } from "@/context/manufacturing-order/manufacturingOrderCorrugatorProcessOperateContext";
import { ManufacturingOrderDialogProvider } from "@/context/manufacturing-order/manufacturingOrderDetailsDialogContent";
import { Box, Heading } from "@chakra-ui/react";

export default function ManufacturingOrderCorrugatorProcessOperate() {
  return (
    <ManufacturingOrderCorrugatorProcessOperateProvider>
      <ManufacturingOrderDialogProvider>
        <Box mt={5}>
          <Heading>Chi tiết quy trình sóng</Heading>
        </Box>

        <DataTableProvider>
          <ManufacturingOrderCorrugatorOperatePageComponents.Table />
        </DataTableProvider>

        <DataTableProvider>
          <ManufacturingOrderCorrugatorOperatePageComponents.Table />
        </DataTableProvider>

        <DataTableProvider>
          <ManufacturingOrderCorrugatorOperatePageComponents.Table />
        </DataTableProvider>

        <ManufacturingOrderDetailsDialog />
        <ManufacturingOrderOrderDetailsConfirmDialog />
      </ManufacturingOrderDialogProvider>
    </ManufacturingOrderCorrugatorProcessOperateProvider>
  );
}
