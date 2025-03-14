import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserRole } from 'src/config/roles';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Request() req,
    @Body(ValidationPipe) createBookingDto: CreateBookingDto,
  ) {
    const accessToken = req.headers['authorization'].replace('Bearer ', '');

    return this.bookingsService.create(accessToken, createBookingDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.bookingsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.COMPANY)
  @Get('company-bookings')
  findCompanyBookings(@Request() req) {
    return this.bookingsService.findCompanyBookings(req.query.travelCompany);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-bookings')
  findUserBookings(@Request() req) {
    const accessToken = req.headers['authorization'].replace('Bearer ', '');
    return this.bookingsService.findUserBookings(accessToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findById(id);
  }
}
