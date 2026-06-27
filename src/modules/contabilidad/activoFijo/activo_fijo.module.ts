import { Module } from '@nestjs/common';
import { ActivoFijoService } from './activo_fijo.service';
import { ActivoFijoController } from './activo_fijo.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivoFijo, ActivoFijoSchema } from './schema/activo_fijo.schema';

@Module({
  controllers: [ActivoFijoController],
  providers: [ActivoFijoService],
  imports: [
    MongooseModule.forFeature([
      { name: ActivoFijo.name, schema: ActivoFijoSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class ActivoFijoModule {}
