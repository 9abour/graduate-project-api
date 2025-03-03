import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Ticket extends Document {
  @Prop({ required: true })
  from: string;

  @Prop({ required: true })
  to: string;

  @Prop({ required: true })
  departureTime: Date;

  @Prop({ required: true })
  arrivalTime: Date;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  availableSeats: number;

  @Prop({ required: true })
  travelCompany: string;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
