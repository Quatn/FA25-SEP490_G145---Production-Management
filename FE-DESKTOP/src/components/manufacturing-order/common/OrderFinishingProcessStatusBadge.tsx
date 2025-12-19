import { manufacturingOrderComponentUtils } from "../utils"
import { Badge } from "@chakra-ui/react"
import check from "check-types"
import { OrderFinishingProcessStatus } from "@/types/enums/OrderFinishingProcessStatus"
import { OrderFinishingProcess } from "@/types/OrderFinishingProcess"

const { OrderFinishingProcessStatusNameMap } = manufacturingOrderComponentUtils

const OrderFinishingProcessProcessProgressColorMap: Record<OrderFinishingProcessStatus, string> = {
  PENDINGAPPROVAL: "gray",
  APPROVED: "cyan",
  SCHEDULED: "cyan",
  INPRODUCTION: "blue",
  ONHOLD: "blue",
  PAUSED: "yellow",
  FINISHEDPRODUCTION: "green",
  CANCELLED: "green",
  QUALITYCHECK: "teal",
  COMPLETED: "green",
}

export type OrderfinishingprocessProcessStatusBadgeProps = {
  process: OrderFinishingProcess | Serialized<OrderFinishingProcess>
}

export default function OrderfinishingprocessProcessStatusBadge({ process }: OrderfinishingprocessProcessStatusBadgeProps) {
  let color = OrderFinishingProcessProcessProgressColorMap[process.status]
  let text = OrderFinishingProcessStatusNameMap[process.status]
  if (check.in(process.status, [OrderFinishingProcessStatus.FinishedProduction, OrderFinishingProcessStatus.Completed])) {
    if (check.less(process.completedAmount, process.requiredAmount as number)) {
      color = "teal"
      text = text + " (sản xuất thiếu)"
    }

    if (check.greater(process.completedAmount, process.requiredAmount as number)) {
      color = "teal"
      text = text + " (sản xuất thừa)"
    }
  }

  return (
    <Badge variant="solid" colorPalette={color} >
      {text}
    </Badge>
  )
}
