import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChequeService } from './cheque.service';
import { ChequeController } from './cheque.controller';
import { Cheque, ChequeSchema } from './schema/cheque.schema';
@Module({
  controllers: [ChequeController],
  providers: [ChequeService],
  imports: [
    MongooseModule.forFeature([{ name: Cheque.name, schema: ChequeSchema }]),
  ],
  exports: [MongooseModule],
})
export class ChequeModule {}
