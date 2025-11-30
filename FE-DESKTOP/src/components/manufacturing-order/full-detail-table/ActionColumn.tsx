import { useDataTableSelector } from "@/components/ui/data-table/Provider";
import { DataTableMeta } from "@/components/ui/data-table/types";
import { toaster } from "@/components/ui/toaster";
import { ManufacturingOrderDetailsDialogReducerStore } from "@/context/manufacturing-order/manufacturingOrderDetailsDialogContent";
import { ManufacturingOrderTableReducerStore } from "@/context/manufacturing-order/manufacturingOrderTableContext";
import { UnpopulatedFieldError } from "@/lib/errors/UnpopulatedFieldError";
import { useDeleteManufacturingOrderMutation, useUpdateManyManufacturingOrdersMutation } from "@/service/api/manufacturingOrderApiSlice";
import { UpdateManyManufacturingOrdersRequestDto } from "@/types/DTO/manufacturing-order/UpdateManyManufacturingOrdersDto";
import { ManufacturingOrder } from "@/types/ManufacturingOrder";
import { Box, Button, Group, Popover, Portal, Stack } from "@chakra-ui/react"
import check from "check-types";
import { BiSolidDownArrow } from "react-icons/bi"

export type ManufacturingOrderTableActionColumnProps = {
  rowId: string,
  mo: Serialized<ManufacturingOrder>,
  isEdited: boolean,
  meta?: DataTableMeta
}

export default function ManufacturingOrderTableActionColumn(props: ManufacturingOrderTableActionColumnProps) {
  const { useDispatch } = ManufacturingOrderTableReducerStore;
  const dispatch = useDispatch();
  const dialogDispatch = ManufacturingOrderDetailsDialogReducerStore.useDispatch();
  const hoveredRowId = useDataTableSelector(s => s.hoveredRowId)

  const [updateOrders] = useUpdateManyManufacturingOrdersMutation();
  const [deleteOrder] = useDeleteManufacturingOrderMutation();

  if (hoveredRowId !== props.rowId) {
    return undefined;
  }

  const handleUpdateOrder = () => {
    if (!props.isEdited) return false

    if (check.string(props.mo.purchaseOrderItem)) {
      throw new UnpopulatedFieldError("mo.purchaseOrderItem should have been populated before it reaches here")
    }

    const dto: UpdateManyManufacturingOrdersRequestDto = {
      orders: [{ ...props.mo, id: props.mo._id, purchaseOrderItemId: props.mo.purchaseOrderItem._id }]
    }

    dispatch({ type: "SET_PREPARED_SUBMIT_ASK_TEXT", payload: `Lưu lệnh ${props.mo.code}?` })
    dispatch({
      type: "SET_PREPARED_SUBMIT_FUNCTION", payload: () => {
        updateOrders(dto).unwrap().then((res) => {
          if (check.equal(res.data?.patchedAmount, 1)) {
            toaster.success({
              title: "Success",
              description: "Updated order successfully",
            })
          }
          toaster.warning({
            title: "Order not updated",
          })
        }).catch(error => {
          toaster.warning({
            title: "Error updating order",
            description: (error as Error).message,
          })
        })
      }
    })
  }

  const handleResetRow = () => {
    if (props.meta?.resetRow) props.meta?.resetRow(props.rowId)
  }

  const handleDeleteOrder = () => {
    dispatch({ type: "SET_PREPARED_SUBMIT_ASK_TEXT", payload: `Xóa lệnh ${props.mo.code}?` })
    dispatch({
      type: "SET_PREPARED_SUBMIT_FUNCTION", payload: () => deleteOrder({
        id: props.rowId
      }).unwrap().then((res) => {
        if (check.equal(res.data?.deletedAmount, 1)) {
          toaster.success({
            title: "Success",
            description: "Updated deleted successfully",
          })
        }
        toaster.warning({
          title: "Order not deleted",
        })
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
                payload: props.mo,
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
