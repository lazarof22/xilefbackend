import { Module } from '@nestjs/common';
import { TipoProveedorService } from './tipo-proveedor.service';
import { TipoProveedorController } from './tipo-proveedor.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TipoProveedor,
  TipoProveedorSchema,
} from './schema/tipo-proveedor.schema';

@Module({
  controllers: [TipoProveedorController],
  providers: [TipoProveedorService],

  imports: [
    MongooseModule.forFeature([
      {
        name: TipoProveedor.name,
        schema: TipoProveedorSchema,
      },
    ]),
  ],
  exports: [MongooseModule],
})
export class TipoProveedorModule {}
