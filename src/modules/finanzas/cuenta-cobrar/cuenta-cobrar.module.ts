import { Module } from '@nestjs/common';
import { CuentaCobrarService } from './cuenta-cobrar.service';
import { CuentaCobrarController } from './cuenta-cobrar.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CuentaCobrar, CuentaCobrarSchema } from './schema/cuenta-cobrar.schema';

@Module({
  controllers: [CuentaCobrarController],
  providers: [CuentaCobrarService],
  imports: [MongooseModule.forFeature([{ name: CuentaCobrar.name, schema: CuentaCobrarSchema }])],
  exports: [MongooseModule],
})
export class CuentaCobrarModule {}
