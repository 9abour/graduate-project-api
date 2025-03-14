import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TravelCompanyService } from './travel-company.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/config/roles';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Controller('travel-companies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TravelCompanyController {
  constructor(
    private readonly travelCompanyService: TravelCompanyService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto, UserRole.COMPANY);
  }

  @Get()
  findAll() {
    return this.travelCompanyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.travelCompanyService.findOne(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.removeById(id);
  }
}
