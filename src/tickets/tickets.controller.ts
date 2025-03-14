import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/config/roles';
import { CreateTicketDto } from 'src/tickets/dto/create-ticket.dto';
import { SearchTicketsDto } from 'src/tickets/dto/search-tickets.dto';
import { TicketsService } from 'src/tickets/tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  @Post()
  create(@Body(ValidationPipe) createTicketDto: CreateTicketDto) {
    return this.ticketsService.create(createTicketDto);
  }

  @Get()
  findAll() {
    return this.ticketsService.findAll();
  }

  @Get('company/:id')
  findCompanyTickets(@Param('id') id: string) {
    return this.ticketsService.findCompanyTickets(id);
  }

  @Get('search')
  search(@Query(ValidationPipe) searchTicketsDto: SearchTicketsDto) {
    return this.ticketsService.search(searchTicketsDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketsService.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(id);
  }
}
