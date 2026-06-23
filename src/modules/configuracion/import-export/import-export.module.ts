import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ImportExportController } from './import-export.controller';
import { ImportExportService } from './import-export.service';
import {
  Producto,
  ProductoSchema,
} from '../../inventario/producto/schemas/producto.schema';
import { NomencladorHelperModule } from '../nomenclador-helper/nomenclador-helper.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Producto.name, schema: ProductoSchema },
    ]),
    NomencladorHelperModule,
  ],
  controllers: [ImportExportController],
  providers: [ImportExportService],
  exports: [ImportExportService],
})
export class ImportExportModule {}
