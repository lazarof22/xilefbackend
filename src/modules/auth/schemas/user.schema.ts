import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  ADMIN = 'administrador',
  EMPLEADO = 'empleado'
}

@Schema()
export class User {
  @Prop()
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: UserRole, default: UserRole.EMPLEADO})
  role: UserRole;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);