import { Exclude } from 'class-transformer';
import { Role } from '../../auth/enum/roles.enum';

export class UserDto {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
    phone?: string;
    isVerified?: boolean;

    @Exclude()
    password: string;

    constructor(partial: Partial<UserDto>) {
        Object.assign(this, partial);
    }
}