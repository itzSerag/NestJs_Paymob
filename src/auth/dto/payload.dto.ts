import { IsBoolean, IsEmail, IsEnum, IsMongoId } from 'class-validator';
import { Role } from '../enum/roles.enum';

export class PayloadDto {
  @IsEnum(Role)
  role?: Role;

  @IsEmail()
  email: string;

  @IsMongoId()
  sub: string;

  @IsBoolean()
  isVerified?: boolean;
}
