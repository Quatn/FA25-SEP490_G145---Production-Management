import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateEmployeeDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    code?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    address?: string | null;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    email?: string | null;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    contactNumber?: string | null;

    @ApiProperty({ required: false, description: "Role ObjectId as string" })
    @IsOptional()
    @IsString()
    role?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    note?: string;
}
