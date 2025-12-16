import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PaperSupplierService } from './paper-supplier.service';
import { CreatePaperSupplierRequestDto } from './dto/create-paper-supplier-request.dto';
import { UpdatePaperSupplierRequestDto } from './dto/update-paper-supplier-request.dto';
import { PaperSupplier, PaperSupplierDocument } from '../schemas/paper-supplier.schema';
import { BaseResponse } from '@/common/dto/response.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaginatedList } from '@/common/dto/paginatedList.dto';
import { PrivilegedJwtAuthGuard } from '@/common/guards/privileged-jwt-auth.guard';
import { paperSupplierAdminPrivileges, paperSupplierCreatePrivileges, paperSupplierGetPrivileges, paperSupplierUpdatePrivileges } from './paper-supplier-module-access-privileges';

const PaperSupplierGetRequestGuard = PrivilegedJwtAuthGuard({
  requiredPrivileges: paperSupplierGetPrivileges,
});

const PaperSupplierCreateRequestGuard = PrivilegedJwtAuthGuard({
  requiredPrivileges: paperSupplierCreatePrivileges,
});

const PaperSupplierUpdateRequestGuard = PrivilegedJwtAuthGuard({
  requiredPrivileges: paperSupplierUpdatePrivileges,
});

const PaperSupplierAdminRequestGuard = PrivilegedJwtAuthGuard({
  requiredPrivileges: paperSupplierAdminPrivileges,
});

@ApiBearerAuth("access-token")
@Controller('paper-supplier')
export class PaperSupplierController {
    constructor(private readonly psService: PaperSupplierService) { }

    @UseGuards(PaperSupplierGetRequestGuard)
    @Get("list")
    @ApiOperation({ summary: "List paginated paper suppliers" })
    async findPaginated(
        @Query("page") page: number = 1,
        @Query("limit") limit: number = 10,
        @Query('search') search?: string,
    ): Promise<BaseResponse<PaginatedList<PaperSupplierDocument>>> {
        const docs = await this.psService.findPaginated(page, limit, search);
        return {
            success: true,
            message: "Fetch successful",
            data: docs,
        };
    }

    @UseGuards(PaperSupplierGetRequestGuard)
    @Get("list-all")
    @ApiOperation({ summary: "List paper suppliers" })
    async findAll(): Promise<BaseResponse<PaperSupplierDocument[]>> {
        const docs = await this.psService.findAll();
        return {
            success: true,
            message: "Fetch successful",
            data: docs,
        };
    }

    @UseGuards(PaperSupplierAdminRequestGuard)
    @Get('list-deleted')
    @ApiOperation({ summary: 'List deleted paper suppliers' })
    async findDeleted(
        @Query("page") page: number = 1,
        @Query("limit") limit: number = 10,
    ): Promise<BaseResponse<PaginatedList<PaperSupplier>>> {
        const docs = await this.psService.findDeleted(page, limit);
        return {
            success: true,
            message: 'Fetch successful',
            data: docs,
        };
    }

    @UseGuards(PaperSupplierGetRequestGuard)
    @Get("detail/:id")
    @ApiOperation({ summary: "Paper supplier detail" })
    async findOne(@Param("id") id: string): Promise<BaseResponse<PaperSupplierDocument>> {
        const doc = await this.psService.findOne(id);
        return {
            success: true,
            message: "Fetch successful",
            data: doc,
        }
    }

    @UseGuards(PaperSupplierCreateRequestGuard)
    @Post("create")
    @ApiOperation({ summary: "Create new paper supplier" })
    async create(
        @Body() dto: CreatePaperSupplierRequestDto,
    ): Promise<BaseResponse<PaperSupplierDocument>> {
        const doc = await this.psService.createOne(dto);
        return {
            success: true,
            message: `Created paper supplier ${doc.code} - ${doc.name} successfully`,
            data: doc,
        };
    }

    @UseGuards(PaperSupplierUpdateRequestGuard)
    @Patch("update/:id")
    @ApiOperation({ summary: "Update paper supplier" })
    async update(
        @Param("id") id: string,
        @Body() dto: UpdatePaperSupplierRequestDto,
    ): Promise<BaseResponse<PaperSupplierDocument>> {
        const doc = await this.psService.updateOne(id, dto);
        return {
            success: true,
            message: `Updated paper supplier ${doc.code} - ${doc.name} successfully`,
            data: doc,
        };
    }

    @UseGuards(PaperSupplierUpdateRequestGuard)
    @Delete("delete-soft/:id")
    @ApiOperation({ summary: "Soft delete paper supplier" })
    async softDelete(
        @Param("id") id: string,
    ): Promise<BaseResponse<null>> {
        await this.psService.softDelete(id);
        return {
            success: true,
            message: "Soft deleted successfully",
            data: null,
        };
    }

    @UseGuards(PaperSupplierAdminRequestGuard)
    @Patch("restore/:id")
    @ApiOperation({ summary: "Restore paper supplier" })
    async restore(
        @Param("id") id: string,
    ): Promise<BaseResponse<null>> {
        await this.psService.restore(id);
        return {
            success: true,
            message: "Restored successfully",
            data: null,
        };
    }

    @UseGuards(PaperSupplierAdminRequestGuard)
    @Delete("delete-hard/:id")
    @ApiOperation({ summary: "Hard delete paper supplier" })
    async hardDelete(
        @Param("id") id: string,
    ): Promise<BaseResponse<null>> {
        await this.psService.removeHard(id);
        return {
            success: true,
            message: "Permanently deleted successfully",
            data: null,
        };
    }
}
