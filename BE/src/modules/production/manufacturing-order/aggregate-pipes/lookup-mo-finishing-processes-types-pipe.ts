import { PipelineStage } from "mongoose";
import { WareFinishingProcessTypeSchema } from "../../schemas/ware-finishing-process-type.schema";
import check from "check-types";

// Populate the wareFinishingProcessType fields inside of the finishingProcesses array on an MO
// Requires the finishingProcesses to be already contructed on a PipelineStage above where is this to be placed

const wfpFields: Record<string, string> = {};
const excludedFields = ["__v", "createdAt", "updatedAt"]

Object.keys(WareFinishingProcessTypeSchema.paths).forEach((f) => {
  if (!check.in(f, [excludedFields])) wfpFields[f] = `$$p.${f}`;
});

export const LookUpMOFinishingProcessesTypesPipeline = [
  {
    $lookup: {
      from: "warefinishingprocesstypes",
      localField: "finishingProcesses.wareFinishingProcessType",
      foreignField: "_id",
      as: "warefinishingprocesstypes",
    },
  },
  {
    $set: {
      warefinishingprocesstypes: {
        $filter: {
          input: "$warefinishingprocesstypes",
          as: "p",
          cond: { $ne: ["$$p.isDeleted", true] },
        },
      },
    },
  },
  {
    $set: {
      finishingProcesses: {
        $filter: {
          input: "$finishingProcesses",
          as: "fp",
          cond: {
            $and: [
              // should've filtered this already, but I'm adding this for redundancy
              { $ne: ["$$fp.isDeleted", true] },

              // referenced wareFinishingProcessType must exist
              {
                $gt: [
                  {
                    $size: {
                      $filter: {
                        input: "$warefinishingprocesstypes",
                        as: "p",
                        cond: {
                          $eq: ["$$p._id", "$$fp.wareFinishingProcessType"],
                        },
                      },
                    },
                  },
                  0,
                ],
              },
            ],
          },
        },
      },
    },
  },
  {
    $set: {
      finishingProcesses: {
        $map: {
          input: "$finishingProcesses",
          as: "item",
          in: {
            $mergeObjects: [
              "$$item",
              {
                wareFinishingProcessType: {
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
                    in: wfpFields,
                  },
                },
              },
            ],
          },
        },
      },
    },
  },
  {
    $unset: ["warefinishingprocesstypes"],
  },
] as PipelineStage[];
