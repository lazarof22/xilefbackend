import { Module } from '@nestjs/common';
import { BancoService } from './banco.service';
import { BancoController } from './banco.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Banco, BancoSchema } from './schema/banco.schema';

@Module({
  controllers: [BancoController],
  providers: [BancoService],
  imports: [MongooseModule.forFeature([{ name: Banco.name, schema: BancoSchema }])],
  exports: [MongooseModule],
})
export class BancoModule {}
