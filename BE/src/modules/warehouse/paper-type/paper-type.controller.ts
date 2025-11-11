import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PaperTypeService } from './paper-type.service';
import { CreatePaperTypeRequestDto } from './dto/create-paper-type-request.dto';
import { UpdatePaperTypeRequestDto } from './dto/update-paper-type-request.dto';
import { PaperTypeDocument } from '../schemas/paper-type.schema';
import { BaseResponse } from '@/common/dto/response.dto';
import { ApiOperation } from '@nestjs/swagger';
import { PaginatedList } from '@/common/dto/paginatedList.dto';
import { PaperColor } from '../schemas/paper-color.schema';

@Controller('paper-type')
export class PaperTypeController {
    constructor(private readonly ptService: PaperTypeService) { }

    // @UseGuards(JwtAuthGuard)
    @Get("list")
    @ApiOperation({ summary: "List paginated paper types" })
    async findPaginated(
        @Query("page") page: number = 1,
        @Query("limit") limit: number = 10,
        @Query('search') search?: string,
    ): Promise<BaseResponse<PaginatedList<PaperTypeDocument>>> {
        const docs = await this.ptService.findPaginated(page, limit, search);
        return {
            success: true,
            message: "Fetch successful",
            data: docs,
        };
    }

    // @UseGuards(JwtAuthGuard)
    @Get("list-all")
    @ApiOperation({ summary: "List paper types" })
    async findAll(): Promise<BaseResponse<PaperTypeDocument[]>> {
        const docs = await this.ptService.findAll();
        return {
            success: true,
            message: "Fetch successful",
            data: docs,
        };
    }

    // @UseGuards(JwtAuthGuard)
    @Get("detail/:id")
    @ApiOperation({ summary: "Paper type detail" })
    async findOne(@Param("id") id: string): Promise<BaseResponse<PaperTypeDocument>> {
        const doc = await this.ptService.findOne(id);
        return {
            success: true,
            message: "Fetch successful",
            data: doc,
        }
    }

    // @UseGuards(JwtAuthGuard)
    @Post("create")
    @ApiOperation({ summary: "Create new paper type" })
    async create(
        @Body() dto: CreatePaperTypeRequestDto,
    ): Promise<BaseResponse<PaperTypeDocument>> {

        const doc = await this.ptService.createOne(dto);

        const populatedDoc = await doc.populate<{ paperColorId: PaperColor }>('paperColorId', 'code title') ?? doc;

        const paperColorCode =
            (populatedDoc.paperColorId as PaperColor)?.code ?? 'Unknown';

        return {
            success: true,
            message: `Created paper type ${paperColorCode}/${doc.width}/${doc.grammage} successfully`,
            data: populatedDoc,
        };
    }

    // @UseGuards(JwtAuthGuard)
    @Patch("update/:id")
    @ApiOperation({ summary: "Update paper Type" })
    async update(
        @Param("id") id: string,
        @Body() dto: UpdatePaperTypeRequestDto,
    ): Promise<BaseResponse<PaperTypeDocument>> {
        const doc = await this.ptService.updateOne(id, dto);

        const populatedDoc = await doc.populate<{ paperColorId: PaperColor }>('paperColorId', 'code title') ?? doc;

        const paperColorCode =
            (populatedDoc.paperColorId as PaperColor)?.code ?? 'Unknown';

        return {
            success: true,
            message: `Updated paper type ${paperColorCode}/${doc.width}/${doc.grammage} successfully`,
            data: populatedDoc,
        };
    }

    // @UseGuards(JwtAuthGuard)
    @Delete("delete-soft/:id")
    @ApiOperation({ summary: "Soft delete paper Type" })
    async softDelete(
        @Param("id") id: string,
    ): Promise<BaseResponse<null>> {
        await this.ptService.softDelete(id);
        return {
            success: true,
            message: "Soft deleted successfully",
            data: null,
        };
    }

    // @UseGuards(JwtAuthGuard)
    @Patch("restore/:id")
    @ApiOperation({ summary: "Restore paper Type" })
    async restore(
        @Param("id") id: string,
    ): Promise<BaseResponse<null>> {
        await this.ptService.restore(id);
        return {
            success: true,
            message: "Restored successfully",
            data: null,
        };
    }

    // @UseGuards(JwtAuthGuard)
    @Delete("delete-hard/:id")
    @ApiOperation({ summary: "Hard delete paper Type" })
    async hardDelete(
        @Param("id") id: string,
    ): Promise<BaseResponse<null>> {
        await this.ptService.removeHard(id);
        return {
            success: true,
            message: "Permanently deleted successfully",
            data: null,
        };
    }
}
