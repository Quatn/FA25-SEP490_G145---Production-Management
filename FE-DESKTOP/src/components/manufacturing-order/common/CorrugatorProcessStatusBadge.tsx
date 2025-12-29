import { CorrugatorProcessStatus } from "@/types/enums/CorrugatorProcessStatus"
import { manufacturingOrderComponentUtils } from "../utils"
import { Badge } from "@chakra-ui/react"
import { CorrugatorProcess } from "@/types/CorrugatorProcess"
import check from "check-types"

const { CorrugatorProcessStatusNameMap } = manufacturingOrderComponentUtils

const CorrugatorProcessProgressColorMap: Record<CorrugatorProcessStatus, string> = {
  NOTSTARTED: "gray",
  RUNNING: "blue",
  PAUSED: "yellow",
  COMPLETED: "green",
  CANCELLED: "red",
  OVERCOMPLETED: "teal",
}

export type CorrugatorProcessStatusBadgeProps = {
  process: CorrugatorProcess
  requiredAmount?: number,
}

export default function CorrugatorProcessStatusBadge({ process, requiredAmount }: CorrugatorProcessStatusBadgeProps) {
  let color = CorrugatorProcessProgressColorMap[process.status]
  let text = CorrugatorProcessStatusNameMap[process.status]
  if (check.in(process.status, [CorrugatorProcessStatus.COMPLETED, CorrugatorProcessStatus.OVERCOMPLETED])) {
    if (check.less(process.manufacturedAmount, requiredAmount as number)) {
      color = CorrugatorProcessProgressColorMap[CorrugatorProcessStatus.OVERCOMPLETED]
      text = text + " (sản xuất thiếu)"
    }

    if (check.greater(process.manufacturedAmount, requiredAmount as number)) {
      color = CorrugatorProcessProgressColorMap[CorrugatorProcessStatus.OVERCOMPLETED]
      text = text + " (sản xuất thừa)"
    }
  }

  return (
    <Badge variant={color === "gray" ? "surface" : "solid"} colorPalette={color} >
      {text}
    </Badge>
  )
}
