import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UsuarioDocument = Usuario & Document;

export enum UsuarioRol {
  ADMIN = 'administrador',
  EMPLEADO = 'empleado',
}

@Schema()
export class Usuario {

  @Prop({ required: true, unique: true })
  ci_empleado!: string;

  @Prop({required: true})
  nombre_empleado!: string;

  @Prop({ required: true, unique: true })
  correo_empleado!: string;

  @Prop({ required: true })
  contraseña!: string;

  @Prop({ required: true })
  departamento!: string;

  @Prop({ required: true })
  cargo!: string;

  @Prop({ required: true })
  salario!: number;

  @Prop({ enum: UsuarioRol, default: UsuarioRol.EMPLEADO})
  rol!: UsuarioRol;

  @Prop({ default: Date.now })
  createdAt!: Date;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);