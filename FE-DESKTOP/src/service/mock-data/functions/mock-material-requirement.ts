import { BaseResponse } from "@/types/DTO/BaseResponse";
import { MaterialRequirementDto } from "@/types/DTO/material-requirement-summary/MaterialRequirement";

const data: MaterialRequirementDto[] = [
  {
    code: "K/VT/125/140",
    requirementWeight: 295,
    inventoryWeight: 1100,
    status: "Đủ",
  },
  {
    code: "K/VT/145/140",
    requirementWeight: 182,
    inventoryWeight: 80,
    status: "Thiếu 102kg",
  },
  {
    code: "K/VT/150/140",
    requirementWeight: 160,
    inventoryWeight: 1200,
    status: "Đủ",
  },
  {
    code: "K/VT/150/140",
    requirementWeight: 190,
    inventoryWeight: 0,
    status: "Thiếu 190kg",
  },
]

export const mockMaterialRequirementQuery = async (
  { orderId }: { orderId: string },
): Promise<BaseResponse<Serialized<MaterialRequirementDto>[]>> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    message: "",
    success: true,
    data: data,
  }

};
