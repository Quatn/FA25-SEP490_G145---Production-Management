import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PaperTypeService } from './paper-type.service';
import { CreatePaperTypeRequestDto } from './dto/create-paper-type-request.dto';
import { UpdatePaperTypeRequestDto } from './dto/update-paper-type-request.dto';
import { PaperType, PaperTypeDocument } from '../schemas/paper-type.schema';
import { BaseResponse } from '@/common/dto/response.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaginatedList } from '@/common/dto/paginatedList.dto';
import { PaperColor } from '../schemas/paper-color.schema';
import { PrivilegedJwtAuthGuard } from '@/common/guards/privileged-jwt-auth.guard';
import { paperTypeAdminPrivileges, paperTypeCreatePrivileges, paperTypeGetPrivileges, paperTypeUpdatePrivileges } from './paper-type-module-access-privileges';

const PaperTypeGetRequestGuard = PrivilegedJwtAuthGuard({
    requiredPrivileges: paperTypeGetPrivileges,
});

const PaperTypeCreateRequestGuard = PrivilegedJwtAuthGuard({
    requiredPrivileges: paperTypeCreatePrivileges,
});

const PaperTypeUpdateRequestGuard = PrivilegedJwtAuthGuard({
    requiredPrivileges: paperTypeUpdatePrivileges,
});

const PaperTypeAdminRequestGuard = PrivilegedJwtAuthGuard({
    requiredPrivileges: paperTypeAdminPrivileges,
});

@ApiBearerAuth("access-token")
@Controller('paper-type')
export class PaperTypeController {
    constructor(private readonly ptService: PaperTypeService) { }

    @UseGuards(PaperTypeGetRequestGuard)
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

    @UseGuards(PaperTypeGetRequestGuard)
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

    @UseGuards(PaperTypeAdminRequestGuard)
    @Get('list-deleted')
    @ApiOperation({ summary: 'List deleted paper types' })
    async findDeleted(
        @Query("page") page: number = 1,
        @Query("limit") limit: number = 10,
    ): Promise<BaseResponse<PaginatedList<PaperType>>> {
        const docs = await this.ptService.findDeleted(page, limit);
        return {
            success: true,
            message: 'Fetch successful',
            data: docs,
        };
    }

    @UseGuards(PaperTypeGetRequestGuard)
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

    @UseGuards(PaperTypeCreateRequestGuard)
    @Post("create")
    @ApiOperation({ summary: "Create new paper type" })
    async create(
        @Body() dto: CreatePaperTypeRequestDto,
    ): Promise<BaseResponse<PaperTypeDocument>> {

        const doc = await this.ptService.createOne(dto);

        const populatedDoc = await doc.populate<{ paperColor: PaperColor }>('paperColor', 'code title') ?? doc;

        const paperColorCode =
            (populatedDoc.paperColor as PaperColor)?.code ?? 'Unknown';

        return {
            success: true,
            message: `Created paper type ${paperColorCode}/${doc.width}/${doc.grammage} successfully`,
            data: populatedDoc,
        };
    }

    @UseGuards(PaperTypeUpdateRequestGuard)
    @Patch("update/:id")
    @ApiOperation({ summary: "Update paper Type" })
    async update(
        @Param("id") id: string,
        @Body() dto: UpdatePaperTypeRequestDto,
    ): Promise<BaseResponse<PaperTypeDocument>> {
        const doc = await this.ptService.updateOne(id, dto);

        const populatedDoc = await doc.populate<{ paperColor: PaperColor }>('paperColor', 'code title') ?? doc;

        const paperColorCode =
            (populatedDoc.paperColor as PaperColor)?.code ?? 'Unknown';

        return {
            success: true,
            message: `Updated paper type ${paperColorCode}/${doc.width}/${doc.grammage} successfully`,
            data: populatedDoc,
        };
    }

    @UseGuards(PaperTypeUpdateRequestGuard)
    @Delete("delete-soft/:id")
    @ApiOperation({ summary: "Soft delete paper type" })
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

    @UseGuards(PaperTypeAdminRequestGuard)
    @Patch("restore/:id")
    @ApiOperation({ summary: "Restore paper type" })
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

    @UseGuards(PaperTypeAdminRequestGuard)
    @Delete("delete-hard/:id")
    @ApiOperation({ summary: "Hard delete paper type" })
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
