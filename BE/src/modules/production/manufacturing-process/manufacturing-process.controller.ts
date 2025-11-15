import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ManufacturingProcessService } from "./manufacturing-process.service";
import { BaseResponse } from "@/common/dto/response.dto";
import { ManufacturingProcessDocument } from "../schemas/manufacturing-process.schema";

@Controller("manufacturing-process")
@ApiTags("ManufacturingProcess")
export class ManufacturingProcessController {
  constructor(private readonly mpService: ManufacturingProcessService) {}

  @Get("list-all")
  @ApiOperation({ summary: "List manufacturing processes (all)" })
  async findAll(): Promise<BaseResponse<ManufacturingProcessDocument[]>> {
    const docs = await this.mpService.findAll();
    return { success: true, message: "Fetch successful", data: docs };
  }
}
