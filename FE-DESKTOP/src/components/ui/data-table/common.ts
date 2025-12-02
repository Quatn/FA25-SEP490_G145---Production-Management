import { Column } from "@tanstack/react-table"
import { CSSProperties } from "react"

export function getCommonPinningStyles<T>(column: Column<T>): CSSProperties {
  const isPinned = column.getIsPinned()
  const isLastLeftPinnedColumn =
    isPinned === 'left' && column.getIsLastColumn('left')
  const isFirstRightPinnedColumn =
    isPinned === 'right' && column.getIsFirstColumn('right')

  return {
    boxSizing: "border-box",
    boxShadow: isLastLeftPinnedColumn
      ? '-4px 0 4px -4px gray inset'
      : isFirstRightPinnedColumn
        ? '4px 0 4px -4px gray inset'
        : undefined,
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    // opacity: isPinned ? 0.95 : 1,
    position: isPinned ? 'sticky' : 'relative',
    // width: column.getIsLastColumn() ? "100%" : column.getSize(),
    width: column.getSize(),
    // paddingRight: isPinned ? "77px" : "0px",
    borderLeft: "-1px solid black",
    zIndex: isPinned ? 1 : 0,
  }
}
