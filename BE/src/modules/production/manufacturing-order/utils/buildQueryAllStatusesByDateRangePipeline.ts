import { PipelineStage } from "mongoose";
import { CompileMOOperativeStatusPipe } from "../aggregate-pipes/compile-operative-status-pipe";
import { QueryOptions } from "mongoose";

export const buildQueryAllMOStatusesByDateRange = ({
  startDate,
  endDate,
}: {
  startDate?: Date;
  endDate?: Date;
}) => {
  const effectiveDateExpr = {
    $ifNull: ["$manufacturingDateAdjustment", "$manufacturingDate"],
  };

  const dateConditions: QueryOptions[] = [];

  if (startDate) {
    dateConditions.push({ $gte: [effectiveDateExpr, startDate] });
  }

  if (endDate) {
    dateConditions.push({ $lte: [effectiveDateExpr, endDate] });
  }

  const pipeline: PipelineStage[] = [
    {
      $match:
        dateConditions.length === 1
          ? { $expr: dateConditions[0] }
          : { $expr: { $and: dateConditions } },
    },
    {
      $lookup: {
        from: "orderfinishingprocesses",
        localField: "_id",
        foreignField: "manufacturingOrder",
        as: "finishingProcesses",
      },
    },
    {
      $match: {
        finishingProcesses: {
          $all: [{ $elemMatch: { $ne: true } }],
        },
      },
    },
    ...CompileMOOperativeStatusPipe,
    {
      $project: {
        _id: 1,
        code: 1,
        manufacturingDate: 1,
        manufacturingDateAdjustment: 1,
        operativeStatus: 1,
      },
    },
  ];

  return pipeline;
};
