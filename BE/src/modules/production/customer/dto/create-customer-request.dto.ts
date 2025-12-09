import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, IsEmail } from 'class-validator';

export class CreateCustomerRequestDto {
    @ApiProperty({
        example: 'DONGTAI',
        description: 'Unique code of the customer',
    })
    @IsString()
    @Matches(/^[A-Z0-9]{2,20}$/, {
        message: 'Code must be between 2 and 20 characters'
    })
    code: string;

    @ApiProperty({
        example: 'DONGTAI VIETNAM INTERNATIONAL CO. LTD',
        description: 'Full name of the customer',
    })
    @IsString()
    name: string;

    @ApiProperty({
        example: '0987654321',
        description: 'Phone number of the customer (optional)',
        required: false,
    })
    @IsOptional()
    @IsString()
    @Matches(/^[0-9\-\+\s]{9,15}$/, {
        message: 'Contact number must be 9–15 digits and may contain +, -, or spaces',
    })
    contactNumber?: string;

    @ApiProperty({
        example: 'NAM TAI INDUSTRIAL PARK, PHU THAI COMMUNE, Hải Phòng, Vietnam',
        description: 'Address of the customer (optional)',
        required: false,
    })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiProperty({
        example: 'contact@hoangha-paper.vn',
        description: 'Email of the customer (optional)',
        required: false,
    })
    @IsOptional()
    @IsEmail({}, { message: 'Invalid email format' })
    email?: string;


    @ApiProperty({
        example: '',
        description: 'Additional note about the customer(optional)',
        required: false,
    })
    @IsOptional()
    @IsString()
    note?: string;
}
