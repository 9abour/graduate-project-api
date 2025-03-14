import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TicketsModule } from '../tickets/tickets.module';
import { Booking, BookingSchema } from 'src/bookings/bookings.schema';
import { BookingsService } from 'src/bookings/bookings.service';
import { BookingsController } from 'src/bookings/bookings.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }]),
    TicketsModule,
    UsersModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
