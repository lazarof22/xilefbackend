import { Module } from '@nestjs/common';
import { CuentaService } from './cuenta.service';
import { CuentaController } from './cuenta.controller';

@Module({
  controllers: [CuentaController],
  providers: [CuentaService],
})
export class CuentaModule {}
