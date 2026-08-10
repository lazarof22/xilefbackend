import { Module } from '@nestjs/common';
import { ProveedorService } from './proveedor.service';
import { ProveedorController } from './proveedor.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Proveedor, ProveedorSchema } from './schema/proveedor.schema';

@Module({
  controllers: [ProveedorController],
  providers: [ProveedorService],
  imports: [
    MongooseModule.forFeature([
      { name: Proveedor.name, schema: ProveedorSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class ProveedorModule {}
