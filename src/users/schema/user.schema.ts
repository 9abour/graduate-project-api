import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from 'src/config/roles';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.TRAVELER })
  userRole: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);
