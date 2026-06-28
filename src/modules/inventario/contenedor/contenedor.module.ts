import { Module } from '@nestjs/common';
import { ContenedorService } from './contenedor.service';
import { ContenedorController } from './contenedor.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Contenedor, ContenedorSchema } from './schema/contenedor.schema';

@Module({
    controllers: [ContenedorController],
    providers: [ContenedorService],

    imports: [MongooseModule.forFeature([{
        name: Contenedor.name,
        schema: ContenedorSchema,
    },]),],
    exports: [MongooseModule],
})

export class ContenedorModule { }
