"use client"
import { toaster } from "@/components/ui/toaster"
import { ManufacturingOrderDetailsDialogReducerStore } from "@/context/manufacturing-order/manufacturingOrderDetailsDialogContent"
import { useCancelManufacturingOrderMutation, useDeleteManufacturingOrderMutation } from "@/service/api/manufacturingOrderApiSlice"
import { ManufacturingOrderApprovalStatus } from "@/types/enums/ManufacturingOrderApprovalStatus"
import { ManufacturingOrder } from "@/types/ManufacturingOrder"
import { Button, Menu, Portal } from "@chakra-ui/react"
import check from "check-types"

export type ManufacturingOrderDetailsDialogDeleteCancelMenuProps = {
  order: Serialized<ManufacturingOrder>
}

export default function ManufacturingOrderDetailsDialogDeleteCancelMenu(props: ManufacturingOrderDetailsDialogDeleteCancelMenuProps) {
  const { useDispatch } = ManufacturingOrderDetailsDialogReducerStore;
  const dispatch = useDispatch();

  const [deleteOrder] = useDeleteManufacturingOrderMutation();
  const handleDeleteOrder = () => {
    dispatch({ type: "SET_PREPARED_SUBMIT_ASK_TEXT", payload: `Xóa lệnh ${props.order.code}?` })
    dispatch({
      type: "SET_PREPARED_SUBMIT_FUNCTION", payload: () => deleteOrder({
        id: props.order._id
      }).unwrap().then((res) => {
        if (check.equal(res.data?.deletedAmount, 1)) {
          toaster.success({
            title: "Success",
            description: "Xóa lệnh thành công",
          })
          dispatch({ type: "SET_OPEN", payload: false })
          dispatch({ type: "SET_ORDER_ID", payload: null })
        }
        else {
          toaster.warning({
            title: "Không thể xóa lệnh",
          })
        }
      }).catch(() => {
        toaster.warning({
          title: "Có lỗi xảy ra trong khi xóa lệnh",
        })
      })
    })
  }

  const [cancelOrder] = useCancelManufacturingOrderMutation();
  const handleCancelOrder = () => {
    dispatch({ type: "SET_PREPARED_SUBMIT_ASK_TEXT", payload: `Hủy lệnh ${props.order.code}?` })
    dispatch({
      type: "SET_PREPARED_SUBMIT_FUNCTION", payload: () => cancelOrder({
        id: props.order._id
      }).unwrap().then((res) => {
        if (check.equal(res.data?.patchedAmount, 1)) {
          toaster.success({
            title: "Success",
            description: "Hủy lệnh thành công",
          })
        }
        else {
          toaster.warning({
            title: "Không thể hủy lệnh",
          })
        }
      }).catch(() => {
        toaster.warning({
          title: "Có lỗi xảy ra trong khi hủy lệnh",
        })
      })
    })
  }

  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button variant="surface" colorPalette={"gray"} size="sm">
          Xóa & Hủy
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content zIndex={9999} p={0}>
            <Menu.Item value="delete">
              <Button
                colorPalette={"red"}
                disabled={props.order.approvalStatus === ManufacturingOrderApprovalStatus.Approved}
                w={"full"}
                onClick={handleDeleteOrder}
              >
                Xóa lệnh
              </Button>
            </Menu.Item>
            <Menu.Item value="cancel" colorPalette={"red"} onClick={handleCancelOrder}>
              <Button
                colorPalette={"red"}
                onClick={handleCancelOrder}
                w={"full"}
              >
                Hủy lệnh
              </Button>
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}
