import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CreditoService } from './credito.service';
import { CreditoController } from './credito.controller';
import { Credito, CreditoSchema } from './schema/credito.schema';
@Module({
  controllers: [CreditoController],
  providers: [CreditoService],
  imports: [MongooseModule.forFeature([{ name: Credito.name, schema: CreditoSchema }])],
  exports: [MongooseModule],
})
export class CreditoModule {}
