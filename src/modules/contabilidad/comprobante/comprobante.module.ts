import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ComprobanteService } from './comprobante.service';
import { ComprobanteController } from './comprobante.controller';
import { Comprobante, ComprobanteSchema } from './schema/comprobante.schema';

@Module({
  controllers: [ComprobanteController],
  providers: [ComprobanteService],
  imports: [
    MongooseModule.forFeature([
      { name: Comprobante.name, schema: ComprobanteSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class ComprobanteModule {}
