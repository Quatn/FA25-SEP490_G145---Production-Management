import { applyDecorators, Type } from "@nestjs/common";
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from "@nestjs/swagger";
import { PaginatedList } from "../dto/paginated-list.dto";
import { BaseResponse } from "../dto/response.dto";

export const ApiResponseWith = <TModel extends Type<any>>(
  model: TModel,
  options?: { paginated?: boolean; isArray?: boolean },
) => {
  const { paginated, isArray } = options || {};
  const dataSchema = isArray
    ? { type: "array", items: { $ref: getSchemaPath(model) } }
    : { $ref: getSchemaPath(model) };

  const wrappedDataSchema = paginated
    ? {
      allOf: [
        { $ref: getSchemaPath(PaginatedList) },
        {
          properties: {
            data: {
              type: "array",
              items: { $ref: getSchemaPath(model) },
            },
          },
        },
      ],
    }
    : dataSchema;

  return applyDecorators(
    ApiExtraModels(BaseResponse, PaginatedList, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(BaseResponse) },
          {
            properties: {
              data: wrappedDataSchema,
            },
          },
        ],
      },
    }),
  );
};
