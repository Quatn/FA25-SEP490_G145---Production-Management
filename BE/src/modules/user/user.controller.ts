import { Body, Controller, Patch, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { ApiOperation } from "@nestjs/swagger";
import {
  CreateUserRequestDto,
  CreateUserResponseDto,
} from "./dto/create-user.dto";
import {
  UpdateManyUsersRequestDto,
  UpdateManyUsersResponseDto,
} from "./dto/update-many-user.dto";
import {
  ChangePasswordRequestDto,
  ChangePasswordResponseDto,
} from "./dto/change-password.dto";

@Controller("user")
export class UserController {
  constructor(private userService: UserService) { }

  @Post("create")
  @ApiOperation({ summary: "Create user for an employee" })
  async createOne(
    @Body() body: CreateUserRequestDto,
  ): Promise<CreateUserResponseDto> {
    const result = await this.userService.createOne(body);
    return {
      success: true,
      message: "Create successful",
      data: result,
    };
  }

  @Patch("update-many")
  @ApiOperation({ summary: "Create user for an employee" })
  async updateMany(
    @Body() body: UpdateManyUsersRequestDto,
  ): Promise<UpdateManyUsersResponseDto> {
    const result = await this.userService.updateMany(body.users);
    return {
      success: true,
      message: "Update successful",
      data: result,
    };
  }

  @Patch("change-password")
  @ApiOperation({ summary: "Create user for an employee" })
  async changePassword(
    @Body() body: ChangePasswordRequestDto,
  ): Promise<ChangePasswordResponseDto> {
    const result = await this.userService.changePassword(body);
    return {
      success: true,
      message: "Change password successful",
      data: result,
    };
  }
}
