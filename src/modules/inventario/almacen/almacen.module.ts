import { Module } from '@nestjs/common';
import { AlmacenService } from './almacen.service';
import { AlmacenController } from './almacen.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Almacen, AlmacenSchema } from './schema/almacen.schema';

@Module({
    controllers: [AlmacenController],
    providers: [AlmacenService],

    imports: [MongooseModule.forFeature([{
        name: Almacen.name,
        schema: AlmacenSchema,
    },]),],
    exports: [MongooseModule],
})

export class AlmacenModule { }