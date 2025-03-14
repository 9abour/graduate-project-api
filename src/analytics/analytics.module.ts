import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsService } from './analytics.service';
import { Ticket, TicketSchema } from 'src/tickets/tickets.schema';
import { User, UserSchema } from 'src/users/schema/user.schema';
import { Booking, BookingSchema } from 'src/bookings/bookings.schema';
import {
  TravelCompany,
  TravelCompanySchema,
} from 'src/travel-company/travel-company.schema';
import { AnalyticsController } from 'src/analytics/analytics.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: Ticket.name, schema: TicketSchema },
      { name: User.name, schema: UserSchema },
      { name: TravelCompany.name, schema: TravelCompanySchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
