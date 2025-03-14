import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TravelCompanyDocument = TravelCompany & Document;

@Schema({ timestamps: true })
export class TravelCompany {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  logo: string;

  @Prop()
  contactEmail: string;

  @Prop()
  contactPhone: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const TravelCompanySchema = SchemaFactory.createForClass(TravelCompany);
