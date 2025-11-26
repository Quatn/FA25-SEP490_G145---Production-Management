import { Body, Controller, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { ApiOperation } from "@nestjs/swagger";
import {
  CreateUserRequestDto,
  CreateUserResponseDto,
} from "./dto/create-user.dto";

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
      message: "Fetch successful",
      data: result,
    };
  }
}
