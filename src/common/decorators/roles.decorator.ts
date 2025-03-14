import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/config/roles';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
