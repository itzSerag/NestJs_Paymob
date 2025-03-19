import { SetMetadata } from '@nestjs/common';
import { Role } from '../enum/roles.enum';

export const Roles = (...roles: string[]) => SetMetadata(Role, roles);
