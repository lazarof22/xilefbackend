import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CombustibleService } from './combustible.service';
import { CombustibleController } from './combustible.controller';
import { Vehiculo, VehiculoSchema } from './schema/vehiculo.schema';
import {
  TarjetaCombustible,
  TarjetaCombustibleSchema,
} from './schema/tarjeta-combustible.schema';
import {
  CargaCombustible,
  CargaCombustibleSchema,
} from './schema/carga-combustible.schema';

@Module({
  controllers: [CombustibleController],
  providers: [CombustibleService],
  imports: [
    MongooseModule.forFeature([
      { name: Vehiculo.name, schema: VehiculoSchema },
      { name: TarjetaCombustible.name, schema: TarjetaCombustibleSchema },
      { name: CargaCombustible.name, schema: CargaCombustibleSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class CombustibleModule {}
