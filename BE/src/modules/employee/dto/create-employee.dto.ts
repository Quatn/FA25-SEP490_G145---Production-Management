import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateEmployeeDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    code: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;

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

    @ApiProperty({ description: "Role ObjectId as string" })
    @IsNotEmpty()
    @IsString()
    role: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    note?: string;
}
