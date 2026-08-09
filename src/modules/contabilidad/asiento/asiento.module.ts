import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AsientoService } from './asiento.service';
import { AsientoController } from './asiento.controller';
import { Asiento, AsientoSchema } from './schema/asiento.schema';

@Module({
  controllers: [AsientoController],
  providers: [AsientoService],
  imports: [
    MongooseModule.forFeature([{ name: Asiento.name, schema: AsientoSchema }]),
  ],
  exports: [MongooseModule],
})
export class AsientoModule {}
