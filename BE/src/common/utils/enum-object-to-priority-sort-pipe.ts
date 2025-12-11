import { PipelineStage } from "mongoose";

export function enumObjectToPrioritySortPipe(
  field: string,
  priorityArray: string[],
  sortDirection: 1 | -1 = 1,
): PipelineStage[] {
  if (priorityArray.length < 1) return [];

  return [
    {
      $addFields: {
        sortPriority: {
          $switch: {
            branches: priorityArray.map((p, index) => ({
              case: { $eq: [field, p] },
              then: index,
            })),
            default: priorityArray.length + 1,
          },
        },
      },
    },
    {
      $sort: { sortPriority: -sortDirection },
    },
    {
      $unset: "sortPriority",
    },
  ] as PipelineStage[];
}
