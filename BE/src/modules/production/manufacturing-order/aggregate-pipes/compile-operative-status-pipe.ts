import { PipelineStage } from "mongoose";
import {
  CorrugatorProcessStatus,
  ManufacturingOrderOperativeStatus,
} from "../../schemas/manufacturing-order.schema";
import { OrderFinishingProcessStatus } from "../../schemas/order-finishing-process.schema";

// Compile the operativeStatus field to the MO based on its corrugatorProcess status and finishingProcesses statuses
// Requires the finishingProcesses to be already contructed on a PipelineStage above where is this to be placed
// Also requires the corrugatorProcess object field to not be removed by a PipelineStage above where is this to be placed
export const CompileMOOperativeStatusPipe = [
  {
    $addFields: {
      finishingProcessesStatuses: {
        $map: {
          input: "$finishingProcesses",
          as: "fp",
          in: "$$fp.status",
        },
      },
    },
  },
  {
    $addFields: {
      operativeStatus: {
        $switch: {
          branches: [
            // 1. corrugator NOTSTARTED
            {
              case: {
                $eq: [
                  "$corrugatorProcess.status",
                  CorrugatorProcessStatus.NOTSTARTED,
                ],
              },
              then: ManufacturingOrderOperativeStatus.NOTSTARTED,
            },

            // 2. corrugator COMPLETED or OVERCOMPLETED AND all processes are finished/checked/completed
            {
              case: {
                $and: [
                  {
                    $in: [
                      "$corrugatorProcess.status",
                      [
                        CorrugatorProcessStatus.COMPLETED,
                        CorrugatorProcessStatus.OVERCOMPLETED,
                      ],
                    ],
                  },
                  {
                    $allElementsTrue: {
                      $map: {
                        input: "$finishingProcessesStatuses",
                        as: "ps",
                        in: {
                          $in: [
                            "$$ps",
                            [
                              OrderFinishingProcessStatus.FinishedProduction,
                              OrderFinishingProcessStatus.QualityCheck,
                              OrderFinishingProcessStatus.Completed,
                            ],
                          ],
                        },
                      },
                    },
                  },
                ],
              },
              then: ManufacturingOrderOperativeStatus.COMPLETED,
            },

            // 3. corrugator RUNNING or any process InProduction
            {
              case: {
                $or: [
                  {
                    $eq: [
                      "$corrugatorProcess.status",
                      CorrugatorProcessStatus.RUNNING,
                    ],
                  },
                  {
                    $anyElementTrue: {
                      $map: {
                        input: "$finishingProcessesStatuses",
                        as: "ps",
                        in: {
                          $eq: [
                            "$$ps",
                            OrderFinishingProcessStatus.InProduction,
                          ],
                        },
                      },
                    },
                  },
                ],
              },
              then: ManufacturingOrderOperativeStatus.RUNNING,
            },

            // 4. corrugator PAUSED or any process Paused
            {
              case: {
                $or: [
                  {
                    $eq: [
                      "$corrugatorProcess.status",
                      CorrugatorProcessStatus.PAUSED,
                    ],
                  },
                  {
                    $anyElementTrue: {
                      $map: {
                        input: "$finishingProcessesStatuses",
                        as: "ps",
                        in: {
                          $eq: ["$$ps", OrderFinishingProcessStatus.Paused],
                        },
                      },
                    },
                  },
                ],
              },
              then: ManufacturingOrderOperativeStatus.PAUSED,
            },

            // 5. corrugator CANCELLED and all processes Cancelled
            {
              case: {
                $and: [
                  {
                    $eq: [
                      "$corrugatorProcess.status",
                      CorrugatorProcessStatus.CANCELLED,
                    ],
                  },
                  {
                    $allElementsTrue: {
                      $map: {
                        input: "$finishingProcessesStatuses",
                        as: "ps",
                        in: {
                          $eq: ["$$ps", OrderFinishingProcessStatus.Cancelled],
                        },
                      },
                    },
                  },
                ],
              },
              then: ManufacturingOrderOperativeStatus.CANCELLED,
            },

            // 6. corrugator CANCELLED or any process Cancelled → PAUSED
            {
              case: {
                $or: [
                  {
                    $eq: [
                      "$corrugatorProcess.status",
                      CorrugatorProcessStatus.CANCELLED,
                    ],
                  },
                  {
                    $anyElementTrue: {
                      $map: {
                        input: "$finishingProcessesStatuses",
                        as: "ps",
                        in: {
                          $eq: ["$$ps", OrderFinishingProcessStatus.Cancelled],
                        },
                      },
                    },
                  },
                ],
              },
              then: ManufacturingOrderOperativeStatus.PAUSED,
            },
          ],

          // Default
          default: ManufacturingOrderOperativeStatus.PAUSED,
        },
      },
    },
  },
  {
    $unset: ["finishingProcessesStatuses"],
  },
] as PipelineStage[];
