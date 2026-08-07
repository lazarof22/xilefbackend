import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NonceUsadoDocument = HydratedDocument<NonceUsado>;

/**
 * Registro de nonces ya utilizados. Sirve para prevenir replay attacks en
 * la activación de licencias. La colección tiene un índice único sobre `nonce`
 * y un TTL index sobre `expireAt` (5 min) para purgar automáticamente.
 */
@Schema({ timestamps: true, collection: 'nonces_usados' })
export class NonceUsado {
  @Prop({ required: true, maxlength: 128 })
  nonce: string;

  @Prop()
  empresa_id?: string;

  @Prop({ type: Date, expires: 300 })
  expireAt: Date;
}

export const NonceUsadoSchema = SchemaFactory.createForClass(NonceUsado);

NonceUsadoSchema.index({ nonce: 1, empresa_id: 1 }, { unique: true });
