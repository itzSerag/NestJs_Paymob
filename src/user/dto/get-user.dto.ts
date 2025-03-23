import { Exclude } from 'class-transformer';
import { Role } from '../../auth/enum/roles.enum';
import { IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ description: 'Unique identifier of the user' })
  @IsMongoId()
  id: string;

  @ApiProperty({ description: 'First name of the user' })
  firstName: string;

  @ApiProperty({ description: 'Last name of the user' })
  lastName: string;

  @ApiProperty({ description: 'Email address of the user' })
  email: string;

  @ApiProperty({ description: 'Role of the user' })
  role: Role;

  @ApiProperty({ description: 'Phone number of the user', required: false })
  phone?: string;

  @ApiProperty({ description: 'Verification status of the user', required: false })
  isVerified?: boolean;

  @Exclude()
  password: string;

  @Exclude()  // Hide _id from the response -- > ITS BIN FORMAT
  _id?: any;

  constructor(user: Partial<UserDto & { _id?: any }>) {
    this.id = user._id?.toString() || user.id; // Convert _id to string
    Object.assign(this, user);
  }
}
