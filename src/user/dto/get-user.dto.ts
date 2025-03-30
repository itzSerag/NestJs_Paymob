import { Exclude } from 'class-transformer';
import { Role } from '../../auth/enum/roles.enum';
import { IsMongoId } from 'class-validator';

export class UserDto {
  @IsMongoId()
  id: string;

  firstName: string;

  lastName: string;

  email: string;

  role: Role;

  phone?: string;

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
