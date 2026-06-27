import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateContenedorDto } from './dto/create-contenedor.dto';
import { UpdateContenedorDto } from './dto/update-contenedor.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Contenedor } from './schema/contenedor.schema';
import { Almacen } from '../almacen/schema/almacen.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class ContenedorService {

    constructor(
        @InjectModel(Contenedor.name) private contenedorModel: Model<Contenedor>,
        @InjectModel(Almacen.name) private almacenModel: Model<Almacen>
    ) { }


    // Crear un contenedor
    async create(
        createContenedorDto: CreateContenedorDto,
    ): Promise<Contenedor> {
        
        const almacenExiste = await this.almacenModel.findById(createContenedorDto.almacen).exec();
        if (!almacenExiste) {
            throw new BadRequestException('El almacén no existe');
        }

        const existContenedor = await this.contenedorModel.findOne({
            nombreContenedor: createContenedorDto.nombreContenedor,
        });

        if (existContenedor) {
            throw new BadRequestException('Ya existe el contenedor');
        }

        const nuevoContenedor = new this.contenedorModel(createContenedorDto);
        const contenedorGuardado = await nuevoContenedor.save();

        // Incrementar la cantidad de contenedores en el almacén
        await this.almacenModel.findByIdAndUpdate(
            createContenedorDto.almacen,
            { $inc: { cantidadContenedores: 1 } }
        );

        return contenedorGuardado;
    }


    // Buscar todos los contenedores
    async findAll(): Promise<Contenedor[]> {
        return this.contenedorModel
            .find()
            .populate('almacen')
            .sort({ createdAt: -1 })
            .exec();
    }


    // Buscar un contenedor
    async findOne(id: string): Promise<Contenedor> {
        const cont = await this.contenedorModel.findById(id).populate('almacen').exec();
        if (!cont) {
            throw new NotFoundException('No se encontró el contenedor');
        }
        return cont;
    }


       // Filtrar contenedores por almacén
    async findByAlmacen(almacenId: string): Promise<Contenedor[]> {
        return this.contenedorModel
            .find({ almacen: almacenId })
            .populate('almacen')
            .sort({ createdAt: -1 })
            .exec();
    }

    // Actualizar un contenedor
    async update(id: string, updateContenedorDto: UpdateContenedorDto): Promise<Contenedor> {
        // Si se cambia el almacén, validar que el nuevo almacén existe
        if (updateContenedorDto.almacen) {
            const almacenExiste = await this.almacenModel.findById(updateContenedorDto.almacen).exec();
            if (!almacenExiste) {
                throw new BadRequestException('El almacén no existe');
            }
        }

        const updatecont = await this.contenedorModel.findByIdAndUpdate(id, updateContenedorDto, { new: true }).exec();

        if (!updatecont) {
            throw new NotFoundException('No se encontró el contenedor');
        }
        return updatecont;
    }


    // Eliminar un contenedor
    async remove(id: string): Promise<void> {
        const contenedor = await this.contenedorModel.findById(id).exec();

        if (!contenedor) {
            throw new NotFoundException('No se encontró el contenedor');
        }

        // Decrementar la cantidad de contenedores en el almacén
        await this.almacenModel.findByIdAndUpdate(
            contenedor.almacen,
            { $inc: { cantidadContenedores: -1 } }
        );

        await this.contenedorModel.findByIdAndDelete(id);
    }
}