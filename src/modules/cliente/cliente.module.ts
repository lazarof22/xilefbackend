import { Module } from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { ClienteController } from './cliente.controller';
import { Cliente, ClienteSchema } from './schemas/cliente.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  controllers: [ClienteController],
  providers: [ClienteService],
  imports: [MongooseModule.forFeature([{
      name: Cliente.name,
      schema: ClienteSchema,},]),],
    exports: [MongooseModule],
})
export class ClienteModule {}
