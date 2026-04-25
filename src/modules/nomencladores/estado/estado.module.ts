import { Module } from '@nestjs/common';
import { EstadoService } from './estado.service';
import { EstadoController } from './estado.controller';
import { Estado, EstadoSchema } from './schema/estado.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  controllers: [EstadoController],
  providers: [EstadoService],

  imports: [MongooseModule.forFeature([{
      name: Estado.name,
      schema: EstadoSchema,
    },
    
    ]),],
})
export class EstadoModule {}
