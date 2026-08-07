import { Module } from '@nestjs/common';
import { BancoService } from './banco.service';
import { BancoController } from './banco.controller';

@Module({
  controllers: [BancoController],
  providers: [BancoService],
})
export class BancoModule {}
