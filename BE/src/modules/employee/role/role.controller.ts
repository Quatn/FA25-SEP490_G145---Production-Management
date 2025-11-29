import { Controller, Get, Param, Query, NotFoundException, BadRequestException } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { RoleService } from "./role.service";
import { isValidObjectId } from "mongoose";

@ApiTags("role")
@ApiBearerAuth("access-token")
@Controller("employee-role/role")
export class RoleController {
    constructor(private readonly roleService: RoleService) { }

    @Get()
    @ApiOperation({ summary: "Get all roles (optional search by q param)" })
    async getAll(@Query("q") q?: string) {
        const search = q?.toString()?.trim();
        const roles = await this.roleService.findAll(search && search.length ? search : undefined);
        return {
            success: true,
            message: "Fetch successful",
            data: roles,
        };
    }

    @Get(":id")
    @ApiOperation({ summary: "Get role by id" })
    async getById(@Param("id") id: string) {
        const trimmed = id?.toString()?.trim();
        if (!trimmed || !isValidObjectId(trimmed)) {
            throw new BadRequestException("Invalid role id");
        }

        const role = await this.roleService.findById(trimmed);
        if (!role) throw new NotFoundException("Role not found");
        return {
            success: true,
            message: "Fetch successful",
            data: role,
        };
    }
}
