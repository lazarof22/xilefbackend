import { Module } from '@nestjs/common';
import { CuentaPagarService } from './cuenta-pagar.service';
import { CuentaPagarController } from './cuenta-pagar.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CuentaPagar, CuentaPagarSchema } from './schema/cuenta-pagar.schema';

@Module({
  controllers: [CuentaPagarController],
  providers: [CuentaPagarService],
  imports: [
    MongooseModule.forFeature([
      { name: CuentaPagar.name, schema: CuentaPagarSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class CuentaPagarModule {}
