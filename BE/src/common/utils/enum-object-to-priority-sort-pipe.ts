import { SortOrder } from "mongoose";
import { PipelineStage } from "mongoose";

export function enumObjectToPrioritySortPipe(
  field: string,
  priorityArray: string[],
  sortDirection: SortOrder = 1,
): {
  precedeStages: PipelineStage[];
  sortStage: Record<string, SortOrder>;
  cleanupStages: PipelineStage[];
} | null {
  if (priorityArray.length < 1) return null;

  const sortField = field.replace(/[^a-zA-Z]/g, "") + "_SortPriority";

  return {
    precedeStages: [
      {
        $addFields: {
          [sortField]: {
            $switch: {
              branches: priorityArray.toReversed().map((p, index) => ({
                case: { $eq: [field, p] },
                then: index,
              })),
              default: -1,
            },
          },
        },
      },
    ],
    sortStage: { [sortField]: sortDirection },
    cleanupStages: [
      {
        $unset: [sortField],
      },
    ],
  };
}
