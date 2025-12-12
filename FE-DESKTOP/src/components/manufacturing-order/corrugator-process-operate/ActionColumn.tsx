import { useDataTableSelector } from "@/components/ui/data-table/Provider";
import { DataTableMeta } from "@/components/ui/data-table/types";
import { toaster } from "@/components/ui/toaster";
import { ManufacturingOrderCorrugatorProcessOperateReducerStore } from "@/context/manufacturing-order/manufacturingOrderCorrugatorProcessOperateContext";
import { ManufacturingOrderDetailsDialogReducerStore } from "@/context/manufacturing-order/manufacturingOrderDetailsDialogContent";
import { UnpopulatedFieldError } from "@/lib/errors/UnpopulatedFieldError";
import { useDeleteManufacturingOrderMutation, useUpdateManyManufacturingOrdersMutation } from "@/service/api/manufacturingOrderApiSlice";
import { UpdateManyManufacturingOrdersRequestDto } from "@/types/DTO/manufacturing-order/UpdateManyManufacturingOrdersDto";
import { ManufacturingOrder } from "@/types/ManufacturingOrder";
import { PurchaseOrderItem } from "@/types/PurchaseOrderItem";
import { tryGetApiErrorMsg } from "@/utils/tryGetApiErrorMsg";
import { Box, Button, Group, Popover, Portal, Stack } from "@chakra-ui/react"
import check from "check-types";
import { BiSolidDownArrow } from "react-icons/bi"

export type ManufacturingOrderCorrugatorOperatePageTableActionColumnProps = {
  rowId: string,
  getOrder: (id: string) => { order: Serialized<ManufacturingOrder> } | undefined,
  isEdited: boolean,
  meta?: DataTableMeta
}

export default function ManufacturingOrderCorrugatorOperatePageTableActionColumn(props: ManufacturingOrderCorrugatorOperatePageTableActionColumnProps) {
  const { useDispatch } = ManufacturingOrderCorrugatorProcessOperateReducerStore;
  const dispatch = useDispatch();
  const dialogDispatch = ManufacturingOrderDetailsDialogReducerStore.useDispatch();
  const hoveredRowId = useDataTableSelector(s => s.hoveredRowId)

  const [updateOrders] = useUpdateManyManufacturingOrdersMutation();
  const [deleteOrder] = useDeleteManufacturingOrderMutation();

  if (hoveredRowId !== props.rowId) {
    return undefined;
  }

  const moObj = props.getOrder(props.rowId)
  const mo = moObj?.order

  if (check.undefined(moObj) || check.undefined(mo)) {
    return undefined;
  }

  const handleUpdateOrder = () => {
    if (!props.isEdited) return false

    if (check.string(mo.purchaseOrderItem)) {
      throw new UnpopulatedFieldError("mo.purchaseOrderItem should have been populated before it reaches here")
    }

    const dto: UpdateManyManufacturingOrdersRequestDto = {
      orders: [{
        id: mo._id,
        corrugatorLineAdjustment: mo.corrugatorLineAdjustment,
        manufacturingDirective: mo.manufacturingDirective,
        amount: mo.amount,
        note: mo.note,
        manufacturingDateAdjustment: mo.manufacturingDateAdjustment,
        requestedDatetime: mo.requestedDatetime,
        purchaseOrderItemId: (mo.purchaseOrderItem as Serialized<PurchaseOrderItem>)._id,
      }]
    }


    dispatch({ type: "SET_PREPARED_SUBMIT_ASK_TEXT", payload: `Lưu lệnh ${mo.code}?` })
    dispatch({
      type: "SET_PREPARED_SUBMIT_FUNCTION", payload: () => {
        updateOrders(dto).unwrap().then((res) => {
          if (check.greaterOrEqual(res.data?.patchedAmount as number, 1)) {
            toaster.success({
              title: "Success",
              description: "Updated order successfully",
            })
          } else {
            toaster.warning({
              title: "Order not updated",
            })
          }
        }).catch(error => {
          toaster.warning({
            title: "Error updating order",
            description: tryGetApiErrorMsg(error),
          })
        })
      }
    })
  }

  const handleResetRow = () => {
    if (props.meta?.resetRow) props.meta?.resetRow(props.rowId)
  }

  const handleDeleteOrder = () => {
    dispatch({ type: "SET_PREPARED_SUBMIT_ASK_TEXT", payload: `Xóa lệnh ${mo.code}?` })
    dispatch({
      type: "SET_PREPARED_SUBMIT_FUNCTION", payload: () => deleteOrder({
        id: props.rowId
      }).unwrap().then((res) => {
        if (check.equal(res.data?.deletedAmount, 1)) {
          toaster.success({
            title: "Success",
            description: "Order deleted successfully",
          })
        }
        else {
          toaster.warning({
            title: "Order not deleted",
          })
        }
      }).catch(error => {
        toaster.warning({
          title: "Error deleting order",
          description: (error as Error).message,
        })
      })
    })
  }

  return (
    <Popover.Root size="xs">
      <Box>
        <Group attached>
          <Button
            size="xs"
            colorPalette={"blue"}
            onClick={() =>
              dialogDispatch({
                type: "OPEN_DIALOG_WITH_ORDER",
                payload: moObj,
              })
            }
          >
            Chi tiết
          </Button>

          <Popover.Trigger asChild>
            <Button variant="solid" size="xs" colorPalette={"gray"} bg={{ base: "colorPalette.emphasized", _hover: "colorPalette.muted" }}>
              <BiSolidDownArrow />
            </Button>
          </Popover.Trigger>
        </Group>

        <Portal>
          <Popover.Positioner>
            <Popover.Content>
              <Stack p={2}>
                <Button disabled={!props.isEdited} size="xs" colorPalette={"green"} bg={{ base: "colorPalette.solid", _hover: "colorPalette.muted" }} onClick={handleUpdateOrder}>Lưu</Button>
                {props.meta?.resetRow && <Button size="xs" disabled={!props.isEdited} colorPalette={"yellow"} bg={{ base: "colorPalette.emphasized", _hover: "colorPalette.muted" }} onClick={handleResetRow}>Hoàn tác</Button>}
                <Button size="xs" colorPalette={"blue"} bg={{ base: "colorPalette.solid", _hover: "colorPalette.emphasized" }}>Ghim lệnh</Button>
                <Button size="xs" colorPalette={"red"} bg={{ base: "colorPalette.solid", _hover: "colorPalette.emphasized" }} onClick={handleDeleteOrder}>Xóa</Button>
              </Stack>
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
      </Box>
    </Popover.Root>
  )
}
