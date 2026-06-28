import { Module } from '@nestjs/common';
import { TransferenciaService } from './transferencia.service';
import { TransferenciaController } from './transferencia.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Transferencia, TransferenciaSchema } from './schema/transferencia.schema';
import { Almacen, AlmacenSchema } from '../almacen/schema/almacen.schema';
import { Contenedor, ContenedorSchema } from '../contenedor/schema/contenedor.schema';
import { Producto, ProductoSchema } from '../producto/schemas/producto.schema';

@Module({
    controllers: [TransferenciaController],
    providers: [TransferenciaService],
    imports: [
        MongooseModule.forFeature([
            { name: Transferencia.name, schema: TransferenciaSchema },
            { name: Almacen.name, schema: AlmacenSchema },
            { name: Contenedor.name, schema: ContenedorSchema },
            { name: Producto.name, schema: ProductoSchema },
        ]),
    ],
    exports: [MongooseModule],
})
export class TransferenciaModule { }
