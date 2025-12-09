"use client"

import { ManufacturingOrderCorrugatorProcessOperateReducerStore } from "@/context/manufacturing-order/manufacturingOrderCorrugatorProcessOperateContext";
import { CorrugatorLine } from "@/types/enums/CorrugatorLine";
import { SegmentGroup } from "@chakra-ui/react";
import check from "check-types";

const CorrugatorLineVals = Object.values(CorrugatorLine)

const corrugatorLines: { label: string, value: string }[] = [
  { label: "Dàn 5", value: CorrugatorLine.L5 },
  { label: "Dàn 7", value: CorrugatorLine.L7 },
]

export default function ManufacturingOrderCorrugatorOperatePageCorrugatorLineSwitcher() {
  const { useDispatch, useSelector } = ManufacturingOrderCorrugatorProcessOperateReducerStore;
  const dispatch = useDispatch();
  const corrugatorLine = useSelector(s => s.corrugatorLine);

  const handleChangeLine = (line: string | null) => {
    if (line) {
      if (check.in(line, CorrugatorLineVals)) {
        dispatch({ type: "SET_SELECTED_CORRUGATOR_LINE", payload: line as CorrugatorLine })
      }
    }
  }

  return (
    <SegmentGroup.Root value={corrugatorLine} onValueChange={(e) => handleChangeLine(e.value)}>
      <SegmentGroup.Indicator />
      <SegmentGroup.Items items={corrugatorLines} />
    </SegmentGroup.Root>
  );
}
