import { Header, HeaderGroup } from "@tanstack/react-table";
import check from "check-types";
import { IllogicalError } from "../errors/IllogicalError";
import { devlog } from "@/utils/devlog";

// TODO: maybe optimize this, doesn't look like the fastest function every
export default function calculateTanstackTableHeaderRowSpan<T>(headerGroups: HeaderGroup<T>[], mergeIds?: string[][]): HeaderGroup<T>[] {
  // return when nothing is needed to be done except set all rowSpan to 1
  const doNothingResult: HeaderGroup<T>[] = headerGroups.map(headerGroup => {
    return {
      id: headerGroup.id,
      depth: headerGroup.depth,
      headers: headerGroup.headers.map(header => ({ ...header, rowSpan: 1 }))
    }
  })

  if (!mergeIds) {
    return doNothingResult
  }

  // beyond this is the logic for vertical header cell merging via rowSpan and conditional rendering
  // devlog("merging headers for a table:", mergeIds)

  const allHeadersFromGroups = headerGroups.flatMap(headerGroup => headerGroup.headers)

  // turn the provided merge ids array into sets of headers that should be merged together, filtering out invalid ids and single item sets
  const headerSetsToMerge = mergeIds.map(ids =>
    ids.map(id => allHeadersFromGroups.find(header => header.id === id)).filter(h => !check.undefined(h))
  ).filter(headers => headers.length > 1).filter(headers => headers.find(header => !header.isPlaceholder))

  if (headerSetsToMerge.length < 1) return doNothingResult;

  // objs representing the merging state. Since html table cells will expand *downward only* when rowSpan is > 1, the cell that represents
  // a bunch of cells merged together must be placed in the top most layer that the cell will inhibit, which is why valueHeaderPlaced exists
  // so that we cal either place the cell (with the correct rowSpan) or not place anything out (which is the conditional rendering thing)
  const mergeObjs = headerSetsToMerge.map(headers => {
    const valueHeader = headers.find(header => !header.isPlaceholder)
    if (check.undefined(valueHeader)) {
      throw new IllogicalError("In calculateTanstackTableHeaderRowSpan function: Previous filtering steps should have left no header sets in headersToMerge without a non-placeholder header")
    }
    return {
      valueHeader,
      ids: headers.map(header => header.id),
      rowSpan: headers.length,
      valueHeaderPlaced: false,
    }
  })

  // the accumulative conditional mapping of pain and aneurysm
  const accHeaderGroups: HeaderGroup<T>[] = []
  for (const headerGroup of headerGroups) {
    const accHeaders: Header<T, unknown>[] = []

    for (const header of headerGroup.headers) {
      // check every mergeObjs to see if this header belongs to a set of headers that are supposed to be merged into one, if that is true 
      // then check to see if the cell that represent the merged headers has already been placed, if that is true then don't place that header 
      // else place it and set valueHeaderPlaced to true to signal that the merged headers for this mergeObj has been placed.
      // else that means that this header is just a normal header, not a merged one, return it with rowSpan = 1
      const getHeader = () => {
        for (const mergeObj of mergeObjs) {
          if (check.contains(mergeObj.ids, header.id)) {
            if (mergeObj.valueHeaderPlaced) return undefined
            mergeObj.valueHeaderPlaced = true;
            return { ...mergeObj.valueHeader, rowSpan: mergeObj.rowSpan }
          }
        }
        return { ...header, rowSpan: 1 }
      }

      const mappedHeader = getHeader()
      if (mappedHeader) accHeaders.push(mappedHeader)
    }

    const mappedHeaderGroup: HeaderGroup<T> = {
      id: headerGroup.id,
      depth: headerGroup.depth,
      headers: accHeaders,
    }
    accHeaderGroups.push(mappedHeaderGroup)
  }

  // devlog("post merge result:", accHeaderGroups)
  return accHeaderGroups
}
