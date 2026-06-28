import { Module } from '@nestjs/common';
import { ReporteCajaService } from './reporte_caja.service';
import { ReporteCajaController } from './reporte_caja.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ReporteCaja, ReporteCajaSchema } from './schema/reporte_caja.schema';
import { Usuario, UsuarioSchema } from '../../auth/schemas/empleado.schema';

@Module({
    controllers: [ReporteCajaController],
    providers: [ReporteCajaService],
    imports: [
        MongooseModule.forFeature([
            { name: ReporteCaja.name, schema: ReporteCajaSchema },
            { name: Usuario.name, schema: UsuarioSchema },
        ]),
    ],
    exports: [MongooseModule],
})
export class ReporteCajaModule { }
