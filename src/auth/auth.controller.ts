import { UsersService } from 'src/users/users.service';
import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { LoginDto } from 'src/auth/dto/login.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);

    const { password, ...result } = user.toObject();

    return result;
  }

  @Post('login')
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Delete('remove-account')
  async removeAccount(@Req() req: Request) {
    const accessToken = req.headers['authorization'].replace('Bearer ', '');

    return this.usersService.remove(accessToken);
  }
}
