import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type ReporteCajaDocument = HydratedDocument<ReporteCaja>;

@Schema()
export class DesgloseBilletes {

    @Prop({ required: true, default: 0 })
    billete5000!: number;

    @Prop({ required: true, default: 0 })
    billete2000!: number;

    @Prop({ required: true, default: 0 })
    billete1000!: number;

    @Prop({ required: true, default: 0 })
    billete500!: number;

    @Prop({ required: true, default: 0 })
    billete200!: number;

    @Prop({ required: true, default: 0 })
    billete100!: number;

    @Prop({ required: true, default: 0 })
    billete50!: number;

    @Prop({ required: true, default: 0 })
    billete20!: number;

    @Prop({ required: true, default: 0 })
    billete10!: number;

    @Prop({ required: true, default: 0 })
    billete5!: number;

    @Prop({ required: true, default: 0 })
    billete3!: number;

    @Prop({ required: true, default: 0 })
    billete1!: number;
}

@Schema({ timestamps: true })
export class ReporteCaja {

    @Prop({ type: Date, default: Date.now })
    fecha!: Date;

    @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
    empleado!: Types.ObjectId;

    @Prop({ required: true, min: 0 })
    cuentas_por_cobrar!: number;

    @Prop({ required: true, type: DesgloseBilletes })
    desglose_billetes!: DesgloseBilletes;

    @Prop({ required: true, min: 0 })
    valor_transferencias!: number;

    @Prop({ required: true, min: 0 })
    recargos!: number;

    @Prop({ required: true, min: 0 })
    descuentos!: number;

    @Prop({})
    otros_motivos!: string;

    @Prop({ required: true, min: 0 })
    monto!: number;
}

export const ReporteCajaSchema = SchemaFactory.createForClass(ReporteCaja);
