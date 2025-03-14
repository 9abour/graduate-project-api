import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TravelCompanyController } from 'src/travel-company/travel-company.controller';
import {
  TravelCompany,
  TravelCompanySchema,
} from 'src/travel-company/travel-company.schema';
import { TravelCompanyService } from 'src/travel-company/travel-company.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TravelCompany.name, schema: TravelCompanySchema },
    ]),
    UsersModule,
  ],
  controllers: [TravelCompanyController],
  providers: [TravelCompanyService],
  exports: [TravelCompanyService],
})
export class TravelCompanyModule {}
