import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Ticket } from 'src/tickets/tickets.schema';
import { User } from 'src/users/schema/user.schema';

@Schema({ timestamps: true })
export class Booking extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Ticket', required: true })
  ticketId: Ticket;

  @Prop({ required: true })
  bookingDate: Date;

  @Prop({ required: true })
  numberOfSeats: number;

  @Prop({ default: false })
  isCancelled: boolean;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
