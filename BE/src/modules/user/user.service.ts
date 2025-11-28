import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument, UserSchema } from "./schemas/user.schema";
import mongoose, { Model } from "mongoose";
import { Employee, EmployeeSchema } from "../employee/schemas/employee.schema";
import { CreateUserRequestDto } from "./dto/create-user.dto";
import { CreateResult } from "@/common/dto/create-result.dto";
import { CryptoService } from "@/common/services/crypto.service";
import { UpdateManyUsersRequestDto } from "./dto/update-many-user.dto";
import { PatchResult } from "@/common/dto/patch-result.dto";
import { UpdateUserRequestDto } from "./dto/update-user.dto";
import { ChangePasswordRequestDto } from "./dto/change-password.dto";
import { AuthService } from "../auth/auth.service";
import check from "check-types";
import bcrypt from "bcrypt";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Employee.name) private readonly employeeModel: Model<Employee>,
    private cryptoService: CryptoService,
  ) { }

  async findAll() {
    return await this.userModel.find();
  }

  async findByCode(code: string) {
    return await this.userModel.findOne({ code });
  }

  async findByEmployeeId(emplId: mongoose.Types.ObjectId) {
    return await this.userModel.findOne({ employee: emplId });
  }

  async validateUser(code: string, password: string): Promise<UserDocument> {
    const user = await this.findByCode(code);
    if (!check.null(user) && !check.undefined(user)) {
      const isMatch = await bcrypt.compare(password, user.password!);
      if (isMatch) {
        const employeePath = UserSchema.path("employee");
        const rolePath = EmployeeSchema.path("role");
        await user.populate({
          path: employeePath.path,
          populate: rolePath.path,
        });
        return user;
      }
      throw new UnauthorizedException("Invalid credentials");
    }
    throw new UnauthorizedException("User not found");
  }

  async createOne(
    dto: CreateUserRequestDto,
  ): Promise<CreateResult<{ code: string }>> {
    const empl = await this.employeeModel.findById(dto.employee);
    if (!empl) {
      throw new BadRequestException(
        `Employee with id ${dto.employee.toHexString()} does not exist.`,
      );
    }

    const codeDup = await this.findByCode(dto.code);
    if (codeDup) {
      throw new BadRequestException(`Duplicate code: ${dto.code}.`);
    }

    const employeeDup = await this.findByEmployeeId(dto.employee);
    if (employeeDup) {
      throw new BadRequestException(
        `Employee with id "${dto.employee.toHexString()}" is aldready an user.`,
      );
    }

    const hashedPassword = await this.cryptoService.hash(dto.password);
    const user = new this.userModel({ ...dto, password: hashedPassword });
    const res = await user.save();

    return {
      requestedAmount: 1,
      createdAmount: 1,
      echo: {
        code: res.code,
      },
    };
  }

  async updateMany(
    dtos: UpdateUserRequestDto[],
  ): Promise<PatchResult<{ codes: string[] }>> {
    const employeePath = UserSchema.path("employee");

    const populate = [employeePath];

    const items = await this.userModel
      .find({
        _id: { $in: dtos.map((d) => d.id) },
      })
      .populate(populate);

    for (const dto of dtos) {
      const doc = items.find((x) => x.id === dto.id);
      if (!doc) continue;

      if (dto.code) {
        const codeDup = await this.findByCode(dto.code);
        if (codeDup) {
          throw new BadRequestException(`Duplicate code: ${dto.code}.`);
        }
      }

      if (dto.password) {
        const hashedPassword = await this.cryptoService.hash(dto.password);
        dto.password = hashedPassword;
      }

      Object.assign(doc, dto);
      await doc.save();
    }

    return {
      requestedAmount: dtos.length,
      patchedAmount: items.length,
      echo: {
        codes: items.map((item) => item.code),
      },
    };
  }

  async changePassword(
    dto: ChangePasswordRequestDto,
  ): Promise<PatchResult<{ code: string }>> {
    const user = await this.userModel.findById(dto.id);

    if (!user) {
      throw new BadRequestException(`User: ${dto.id.toString()} not found`);
    }

    await this.validateUser(user.code, dto.currentPassword);
    const hashedPassword = await this.cryptoService.hash(dto.newPassword);
    user.password = hashedPassword;

    await user.save();

    return {
      requestedAmount: 1,
      patchedAmount: 1,
      echo: {
        code: user.code,
      },
    };
  }
}
