import { PageResponse } from "@/types/DTO/PageResponse";
import { MATERIAL_REQUIREMENT_URL } from "../constants";
import { apiSlice } from "./apiSlice";
import { createApiEndpoint } from "@/utils/endpointFactory";
import { MaterialRequirementDto } from "@/types/DTO/material-requirement-summary/MaterialRequirement";
import { BaseResponse } from "@/types/DTO/BaseResponse";
import { mockMaterialRequirementQuery } from "../mock-data/functions/mock-material-requirement";

export const materialRequirementApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMaterialRequirements: createApiEndpoint<
      BaseResponse<Serialized<MaterialRequirementDto>[]>,
      { orderId: string }
    >(builder, {
      query: ({ orderId }) => ({
        url: `${MATERIAL_REQUIREMENT_URL}/order/${orderId}/paper-width`,
        method: "GET",
        params: { orderId },
        credentials: "include",
      }),
      providesTags: ["MaterialRequirement"],
      doMock: true,
      mockFn: ({ orderId }) => mockMaterialRequirementQuery({ orderId }),
    }),
  }),
});

export const {
  useGetMaterialRequirementsQuery,
} = materialRequirementApiSlice;
