import { PurchaseOrder } from "@/types/PurchaseOrder";
import { formatDateToDDMMYYYY } from "@/utils/dateUtils";
import { Box, DataList } from "@chakra-ui/react";

export type PurchaseOrderDetailStackProps = {
  po: PurchaseOrder;
};

export default function PurchaseOrderDetailStack(
  { po }: PurchaseOrderDetailStackProps,
) {
  return (
    <Box m={5} p={2} rounded={"sm"} bg={"white"}>
      <DataList.Root size="lg" orientation={"horizontal"} divideY="1px">
        <DataList.Item>
          <DataList.ItemLabel>Id</DataList.ItemLabel>{" "}
          <DataList.ItemValue>{po.id}</DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>
            Customer Code
          </DataList.ItemLabel>
          <DataList.ItemValue>{po.customerCode}</DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>Order Date</DataList.ItemLabel>
          <DataList.ItemValue>
            {formatDateToDDMMYYYY(po.orderDate)}
          </DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>
            Delivery Adress
          </DataList.ItemLabel>
          <DataList.ItemValue>{po.deliveryAdress}</DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>
            Payment Terms
          </DataList.ItemLabel>
          <DataList.ItemValue>{po.paymentTerms}</DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>Notes</DataList.ItemLabel>
          <DataList.ItemValue>{po.notes}</DataList.ItemValue>
        </DataList.Item>
      </DataList.Root>
    </Box>
  );
}
