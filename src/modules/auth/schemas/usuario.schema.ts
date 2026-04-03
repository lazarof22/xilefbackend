import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UsuarioDocument = Usuario & Document;

export enum UsuarioRol {
  ADMIN = 'administrador',
  EMPLEADO = 'empleado',
  CLIENTE = 'cliente'
}

@Schema()
export class Usuario {
  @Prop()
  nombre_usuario: string;

  @Prop({ required: true, unique: true })
  correo_usuario: string;

  @Prop({ required: true })
  contraseña: string;

  @Prop({ enum: UsuarioRol, default: UsuarioRol.EMPLEADO})
  rol: UsuarioRol;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);