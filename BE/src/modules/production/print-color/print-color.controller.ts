import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { PrintColorService } from "./print-color.service";
import { BaseResponse } from "@/common/dto/response.dto";
import { PrintColorDocument } from "../schemas/print-color.schema";

@Controller("print-color")
@ApiTags("PrintColor")
export class PrintColorController {
  constructor(private readonly pcService: PrintColorService) {}

  @Get("list-all")
  @ApiOperation({ summary: "List print colors (all)" })
  async findAll(): Promise<BaseResponse<PrintColorDocument[]>> {
    const docs = await this.pcService.findAll();
    return { success: true, message: "Fetch successful", data: docs };
  }
}
