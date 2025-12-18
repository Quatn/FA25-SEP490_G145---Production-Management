import { PipelineStage } from "mongoose";
import { QueryOptions } from "mongoose";

export const buildQueryAllMOProductionOutputByDateRange = ({
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
    {
      $lookup: {
        from: "warefinishingprocesstypes",
        localField: "finishingProcesses.wareFinishingProcessType",
        foreignField: "_id",
        as: "warefinishingprocesstypes",
      },
    },
    {
      $project: {
        _id: 1,
        code: 1,
        manufacturingDate: 1,
        manufacturingDateAdjustment: 1,
        "corrugatorProcess.manufacturedAmount": 1,
        finishingProcesses: {
          $map: {
            input: "$finishingProcesses",
            as: "item",
            in: {
              code: "$$item.code",
              requiredAmount: "$$item.requiredAmount",
              completedAmount: "$$item.completedAmount",
              warefinishingprocesstype: {
                $let: {
                  vars: {
                    p: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$warefinishingprocesstypes",
                            as: "p",
                            cond: {
                              $eq: [
                                "$$p._id",
                                "$$item.wareFinishingProcessType",
                              ],
                            },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: {
                    code: "$$p.code",
                  },
                },
              },
            },
          },
        },
      },
    },
  ];

  return pipeline;
};
