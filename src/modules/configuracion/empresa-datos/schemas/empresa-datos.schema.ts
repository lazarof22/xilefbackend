import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type EmpresaDatosDocument = HydratedDocument<EmpresaDatos>;

@Schema({ timestamps: true, collection: 'empresa_datos' })
export class EmpresaDatos {
  @Prop({ required: true })
  nombre?: string;

  @Prop()
  eslogan?: string;

  @Prop()
  direccion?: string;

  @Prop()
  telefono?: string;

  @Prop()
  email?: string;

  @Prop()
  ruc_nit?: string;

  @Prop()
  ciudad?: string;

  @Prop({ type: Types.ObjectId, ref: 'Pais' })
  pais?: Types.ObjectId;

  @Prop()
  logo?: string;
}

export const EmpresaDatosSchema = SchemaFactory.createForClass(EmpresaDatos);
