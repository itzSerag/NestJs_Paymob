import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class RestPasswordDto {
    @ApiProperty({ description: 'Old password', minLength: 6, maxLength: 20 })
    @IsString()
    @Length(6, 20)
    oldPassword: string;

    @ApiProperty({ description: 'New password', minLength: 6, maxLength: 20 })
    @IsString()
    @Length(6, 20)
    newPassword: string;
}