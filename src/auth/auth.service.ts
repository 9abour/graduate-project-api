import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(usersService: UsersService) {}

  async register() {}
  async login() {}
}
