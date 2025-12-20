import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PaperColorService } from './paper-color.service';
import { CreatePaperColorRequestDto } from './dto/create-paper-color-request.dto';
import { UpdatePaperColorRequestDto } from './dto/update-paper-color-request.dto';
import { PaperColor, PaperColorDocument } from '../schemas/paper-color.schema';
import { BaseResponse } from '@/common/dto/response.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaginatedList } from '@/common/dto/paginatedList.dto';
import { PrivilegedJwtAuthGuard } from '@/common/guards/privileged-jwt-auth.guard';
import { paperColorAdminPrivileges, paperColorCreatePrivileges, paperColorGetPrivileges, paperColorUpdatePrivileges } from './paper-color-module-access-privileges';

const PaperColorGetRequestGuard = PrivilegedJwtAuthGuard({
    requiredPrivileges: paperColorGetPrivileges,
});

const PaperColorCreateRequestGuard = PrivilegedJwtAuthGuard({
    requiredPrivileges: paperColorCreatePrivileges,
});

const PaperColorUpdateRequestGuard = PrivilegedJwtAuthGuard({
    requiredPrivileges: paperColorUpdatePrivileges,
});

const PaperColorAdminRequestGuard = PrivilegedJwtAuthGuard({
    requiredPrivileges: paperColorAdminPrivileges,
});

@ApiBearerAuth("access-token")
@Controller('paper-color')
export class PaperColorController {
    constructor(private readonly pcService: PaperColorService) { }

    // @UseGuards(PaperColorGetRequestGuard)
    @Get("list")
    @ApiOperation({ summary: "List paginated paper colors" })
    async findPaginated(
        @Query("page") page: number = 1,
        @Query("limit") limit: number = 10,
        @Query('search') search?: string,
    ): Promise<BaseResponse<PaginatedList<PaperColorDocument>>> {
        const docs = await this.pcService.findPaginated(page, limit, search);
        return {
            success: true,
            message: "Fetch successful",
            data: docs,
        };
    }

    @UseGuards(PaperColorAdminRequestGuard)
    @Get('list-deleted')
    @ApiOperation({ summary: 'List deleted paper colors' })
    async findDeleted(
        @Query("page") page: number = 1,
        @Query("limit") limit: number = 10,
    ): Promise<BaseResponse<PaginatedList<PaperColor>>> {
        const docs = await this.pcService.findDeleted(page, limit);
        return {
            success: true,
            message: 'Fetch successful',
            data: docs,
        };
    }

    // @UseGuards(PaperColorGetRequestGuard)
    @Get("list-all")
    @ApiOperation({ summary: "List paper colors" })
    async findAll(): Promise<BaseResponse<PaperColorDocument[]>> {
        const docs = await this.pcService.findAll();
        return {
            success: true,
            message: "Fetch successful",
            data: docs,
        };
    }

    // @UseGuards(PaperColorGetRequestGuard)
    @Get("detail/:id")
    @ApiOperation({ summary: "Paper color detail" })
    async findOne(@Param("id") id: string): Promise<BaseResponse<PaperColorDocument>> {
        const doc = await this.pcService.findOne(id);
        return {
            success: true,
            message: "Fetch successful",
            data: doc,
        }
    }

    @UseGuards(PaperColorCreateRequestGuard)
    @Post("create")
    @ApiOperation({ summary: "Create new paper color" })
    async create(
        @Body() dto: CreatePaperColorRequestDto,
    ): Promise<BaseResponse<PaperColorDocument>> {
        const doc = await this.pcService.createOne(dto);
        return {
            success: true,
            message: `Created paper color ${doc.code} - ${doc.title} successfully`,
            data: doc,
        };
    }

    @UseGuards(PaperColorUpdateRequestGuard)
    @Patch("update/:id")
    @ApiOperation({ summary: "Update paper color" })
    async update(
        @Param("id") id: string,
        @Body() dto: UpdatePaperColorRequestDto,
    ): Promise<BaseResponse<PaperColorDocument>> {
        const doc = await this.pcService.updateOne(id, dto);
        return {
            success: true,
            message: `Updated paper color ${doc.code} - ${doc.title} successfully`,
            data: doc,
        };
    }

    @UseGuards(PaperColorUpdateRequestGuard)
    @Delete("delete-soft/:id")
    @ApiOperation({ summary: "Soft delete paper color" })
    async softDelete(
        @Param("id") id: string,
    ): Promise<BaseResponse<null>> {
        await this.pcService.softDelete(id);
        return {
            success: true,
            message: "Soft deleted successfully",
            data: null,
        };
    }

    @UseGuards(PaperColorAdminRequestGuard)
    @Patch("restore/:id")
    @ApiOperation({ summary: "Restore paper color" })
    async restore(
        @Param("id") id: string,
    ): Promise<BaseResponse<null>> {
        await this.pcService.restore(id);
        return {
            success: true,
            message: "Restored successfully",
            data: null,
        };
    }

    @UseGuards(PaperColorAdminRequestGuard)
    @Delete("delete-hard/:id")
    @ApiOperation({ summary: "Hard delete paper color" })
    async hardDelete(
        @Param("id") id: string,
    ): Promise<BaseResponse<null>> {
        await this.pcService.removeHard(id);
        return {
            success: true,
            message: "Permanently deleted successfully",
            data: null,
        };
    }
}
