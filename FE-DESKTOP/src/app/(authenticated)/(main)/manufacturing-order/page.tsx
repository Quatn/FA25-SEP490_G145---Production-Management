import ManufacturingOrderOrderDetailsConfirmDialog from "@/components/manufacturing-order/order-details-dialog/ConfirmDialog";
import ManufacturingOrderDetailsDialog from "@/components/manufacturing-order/order-details-dialog/Dialog";
import { ManufacturingOrderTrackPanel } from "@/components/manufacturing-order/track-panel/components";
import { ManufacturingOrderDialogProvider } from "@/context/manufacturing-order/manufacturingOrderDetailsDialogContent";
import { ManufacturingOrderTrackPanelListProvider } from "@/context/manufacturing-order/manufacturingOrderTrackPanelContext";
import { Box, Heading } from "@chakra-ui/react";

export default function ManufacturingOrderDashboard() {
  return (
    <ManufacturingOrderTrackPanelListProvider>
      <ManufacturingOrderDialogProvider>
        <Box mt={5}>
          <Heading>Dashboard lệnh sản xuất</Heading>
          <ManufacturingOrderTrackPanel.List />
        </Box>
        <ManufacturingOrderDetailsDialog />
        <ManufacturingOrderOrderDetailsConfirmDialog />
      </ManufacturingOrderDialogProvider>
    </ManufacturingOrderTrackPanelListProvider>
  );
}
