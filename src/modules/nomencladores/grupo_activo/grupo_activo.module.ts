import { Module } from '@nestjs/common';
import { GrupoActivoService } from './grupo_activo.service';
import { GrupoActivoController } from './grupo_activo.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { GrupoActivo, GrupoActivoSchema } from './schema/grupo_activo.schema';

@Module({
  controllers: [GrupoActivoController],
  providers: [GrupoActivoService],
  imports: [MongooseModule.forFeature([{ name: GrupoActivo.name, schema: GrupoActivoSchema }])],
  exports: [MongooseModule],
})
export class GrupoActivoModule {}
