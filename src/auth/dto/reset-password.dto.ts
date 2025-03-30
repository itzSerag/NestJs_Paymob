import { IsString, Length } from 'class-validator';

export class RestPasswordDto {
    @IsString()
    @Length(6, 20)
    oldPassword: string;

    @IsString()
    @Length(6, 20)
    newPassword: string;
}