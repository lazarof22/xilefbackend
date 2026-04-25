import { Module } from '@nestjs/common';
import { ActivoFijoService } from './activo_fijo.service';
import { ActivoFijoController } from './activo_fijo.controller';

@Module({
  controllers: [ActivoFijoController],
  providers: [ActivoFijoService],
})
export class ActivoFijoModule {}
