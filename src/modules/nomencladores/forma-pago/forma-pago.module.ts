import { Module } from '@nestjs/common';
import { FormaPagoService } from './forma-pago.service';
import { FormaPagoController } from './forma-pago.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FormaPago, FormaPagoSchema } from './schema/forma-pago.schema';

@Module({
  controllers: [FormaPagoController],
  providers: [FormaPagoService],

  imports: [
    MongooseModule.forFeature([
      {
        name: FormaPago.name,
        schema: FormaPagoSchema,
      },
    ]),
  ],
  exports: [MongooseModule],
})
export class FormaPagoModule {}
