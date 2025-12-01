import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Role } from "../schemas/role.schema";
import { Model, isValidObjectId } from "mongoose";

@Injectable()
export class RoleService {
    constructor(
        @InjectModel(Role.name) private readonly roleModel: Model<Role>,
    ) { }

    async findAll(search?: string) {
        const filter: any = {};
        if (search && String(search).trim() !== "") {
            const re = new RegExp(String(search).trim(), "i");
            filter.$or = [{ code: re }, { name: re }];
        }
        return await this.roleModel.find(filter).sort({ code: 1 }).lean();
    }

    async findById(id: string) {
        if (!id || !isValidObjectId(id)) return null;
        return await this.roleModel.findById(id).lean();
    }
}
