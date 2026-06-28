import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UsuarioDocument = Usuario & Document;

export enum UsuarioRol {
  ADMIN = 'administrador',
  EMPLEADO = 'empleado',
  JEFE = 'jefe',
  FACTURADOR = 'facturador',
  CAJERO = 'cajero'

}

@Schema()
export class Usuario {

  @Prop({ required: true, unique: true })
  ci_empleado!: string;

  @Prop({required: true})
  nombre_empleado!: string;

  @Prop({ required: true, unique: true })
  correo_empleado!: string;

  @Prop({ required: true, select: false })
  contraseña!: string;

  @Prop({ type: Types.ObjectId, ref: 'Departamento', required: true })
  departamento!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CargoEmpleado', required: true})
  cargo!: Types.ObjectId;

  @Prop({ required: true })
  salario!: number;

  @Prop({ enum: UsuarioRol, default: UsuarioRol.EMPLEADO})
  rol!: UsuarioRol;

  @Prop({ default: Date.now })
  createdAt!: Date;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);