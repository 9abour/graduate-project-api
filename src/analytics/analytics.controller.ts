import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Post,
  Res,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/config/roles';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('booking-stats')
  async getBookingStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('travelCompanyId') travelCompanyId?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.analyticsService.getBookingStats(start, end, travelCompanyId);
  }

  @Get('ticket-stats')
  async getTicketStats(@Query('travelCompanyId') travelCompanyId?: string) {
    return this.analyticsService.getTicketStats(travelCompanyId);
  }

  @Get('user-stats')
  async getUserStats() {
    return this.analyticsService.getUserStats();
  }

  @Post('export-bookings')
  async exportBookings(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('travelCompanyId') travelCompanyId?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    try {
      const filePath = await this.analyticsService.exportBookings(
        start,
        end,
        travelCompanyId,
      );
      const fileName = path.basename(filePath);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error exporting bookings', error: error.message });
    }
  }

  @Post('export-tickets')
  async exportTickets(
    @Res() res: Response,
    @Query('travelCompanyId') travelCompanyId?: string,
  ) {
    try {
      const filePath =
        await this.analyticsService.exportTickets(travelCompanyId);
      const fileName = path.basename(filePath);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error exporting tickets', error: error.message });
    }
  }

  @Post('export-users')
  async exportUsers(@Res() res: Response) {
    try {
      const filePath = await this.analyticsService.exportUserStats();
      const fileName = path.basename(filePath);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error exporting users', error: error.message });
    }
  }

  @Get('dashboard')
  async getDashboardData() {
    const bookingStats = await this.analyticsService.getBookingStats();
    const ticketStats = await this.analyticsService.getTicketStats();
    const userStats = await this.analyticsService.getUserStats();

    return {
      bookingStats,
      ticketStats,
      userStats,
    };
  }

  @Get('companies/:id/stats')
  async getCompanyStats(@Param('id') companyId: string) {
    const bookingStats = await this.analyticsService.getBookingStats(
      undefined,
      undefined,
      companyId,
    );
    const ticketStats = await this.analyticsService.getTicketStats(companyId);

    return {
      bookingStats,
      ticketStats,
    };
  }
}
