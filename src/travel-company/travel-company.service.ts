import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  TravelCompany,
  TravelCompanyDocument,
} from 'src/travel-company/travel-company.schema';

@Injectable()
export class TravelCompanyService {
  constructor(
    @InjectModel(TravelCompany.name)
    private travelCompanyModel: Model<TravelCompanyDocument>,
  ) {}

  async findAll(): Promise<TravelCompany[]> {
    return this.travelCompanyModel.find().exec();
  }

  async findOne(id: string): Promise<TravelCompany> {
    const travelCompany = await this.travelCompanyModel.findById(id).exec();
    if (!travelCompany) {
      throw new NotFoundException(`Travel company with ID "${id}" not found`);
    }
    return travelCompany;
  }
}
