import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TicketsModule } from 'src/tickets/tickets.module';
import { BookingsModule } from 'src/bookings/bookings.module';
import { TravelCompanyModule } from 'src/travel-company/travel-company.module';
import { AnalyticsModule } from 'src/analytics/analytics.module';

const uri = `mongodb+srv://9abour:Ql2jXRojxPA3Y85o@cluster0.hq8eh.mongodb.net/`;

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(uri),
    UsersModule,
    TicketsModule,
    BookingsModule,
    AuthModule,
    TravelCompanyModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
