import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length, Matches, IsEmail } from 'class-validator';

export class CreatePaperSupplierRequestDto {
    @ApiProperty({
        example: 'HH',
        description: 'Unique code of the paper supplier',
    })
    @IsString()
    @Matches(/^[A-Z0-9]{2,3}$/, {
        message: 'Code must be between 2 and 3 characters'
    })
    code: string;

    @ApiProperty({
        example: 'HOÀNG HÀ',
        description: 'Full name of the paper supplier',
    })
    @IsString()
    @Matches(/^(?!.* {2})[A-ZÀ-Ỹ0-9 ]{2,20}$/, {
        message: 'Name must be between 2 and 20 characters'
    })
    name: string;

    @ApiProperty({
        example: '0987654321',
        description: 'Phone number of the paper supplier (optional)',
        required: false,
    })
    @IsOptional()
    @IsString()
    @Matches(/^[0-9\-\+\s]{9,15}$/, {
        message: 'Phone number must be 9–15 digits and may contain +, -, or spaces',
    })
    phone?: string;

    @ApiProperty({
        example: 'KCN Sóng Thần, Bình Dương',
        description: 'Address of the paper supplier (optional)',
        required: false,
    })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiProperty({
        example: 'contact@hoangha-paper.vn',
        description: 'Email of the paper supplier (optional)',
        required: false,
    })
    @IsOptional()
    @IsEmail({}, { message: 'Invalid email format' })
    email?: string;

    @ApiProperty({
        example: 'Vietcombank - CN Bình Dương',
        description: 'Bank name (optional)',
        required: false,
    })
    @IsOptional()
    @IsString()
    bank?: string;

    @ApiProperty({
        example: '0123456789',
        description: 'Bank account number (optional)',
        required: false,
    })
    @IsOptional()
    @IsString()
    @Matches(/^[0-9]{6,20}$/, {
        message: 'Bank account must be 6–20 digits',
    })
    bankAccount?: string;

    @ApiProperty({
        example: 'Chuyên cung cấp giấy carton 3 lớp',
        description: 'Additional note about the supplier (optional)',
        required: false,
    })
    @IsOptional()
    @IsString()
    note?: string;
}
