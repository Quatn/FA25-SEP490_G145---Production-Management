import check from "check-types";
import { QueryListFullDetailsManufacturingOrderRequestSortOptions } from "../dto/query-list-full-details.dto";
import { PipelineStage } from "mongoose";

export const buildFullDetailsMOSortPipesFromDto = (
  options: {
    option: QueryListFullDetailsManufacturingOrderRequestSortOptions;
    value: number;
  }[],
) => {
  const sorts: PipelineStage[] = [];

  return sorts;
};
