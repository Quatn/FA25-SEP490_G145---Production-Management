import { PipelineStage } from "mongoose";

export type EmployeeDetailsFilterAggregateFilters = {
  hasUser: 1 | 0 | -1;
};

export function fullDetailsFilterAggregationPipeline({
  filter = {},
  skip = 0,
  limit = 20,
  sort = [],
}: {
  filter: PipelineStage.Match | object;
  skip: number;
  limit: number;
  sort: EmployeeDetailsFilterAggregateFilters[];
}) {
  const pipeline: PipelineStage[] = [];

  pipeline.push(
    {
      $lookup: {
        from: "roles",
        localField: "role",
        foreignField: "_id",
        as: "role",
      },
    },
    {
      $unwind: {
        path: "$role",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $lookup: {
        from: "users",
        let: { empId: "$_id" },
        pipeline: [{ $match: { $expr: { $eq: ["$employee", "$$empId"] } } }],
        as: "user",
      },
    },
    {
      $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: true,
      },
    },
  );

  // Optimize later (trust me bro)
  sort.forEach((s) => {
    if (s.hasUser != 0) {
      pipeline.push(
        {
          $addFields: {
            hasUser: { $cond: [{ $ifNull: ["$user", false] }, 1, 0] },
          },
        },
        {
          $sort: { hasUser: s.hasUser },
        },
        {
          $unset: "hasUser",
        },
      );
    }
  });

  /*
   * idk
  const cleanedFilter = Object.fromEntries(
    Object.entries(filter).filter(([key, _]) => !key.toLowerCase().includes('password'))
  );
  */

  const mainFilters: Record<string, unknown> = {};
  const nestedFilters: Record<string, unknown> = {};

  for (const key in filter) {
    if (!key.includes(".")) mainFilters[key] = filter[key] as unknown;
    else nestedFilters[key] = filter[key] as unknown;
  }

  if (Object.keys(mainFilters).length > 0) {
    pipeline.push({ $match: mainFilters });
  }

  if (Object.keys(nestedFilters).length) {
    const nestedMatch = {};
    for (const key in nestedFilters) {
      nestedMatch[key] = nestedFilters[key];
    }
    pipeline.push({ $match: nestedMatch });
  }

  if (skip) pipeline.push({ $skip: skip });
  if (limit) pipeline.push({ $limit: limit });

  return pipeline;
}
