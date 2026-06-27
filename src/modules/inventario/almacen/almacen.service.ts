import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateAlmacenDto } from './dto/create-almacen.dto';
import { UpdateAlmacenDto } from './dto/update-almacen.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Almacen } from './schema/almacen.schema';
import { Model } from 'mongoose';

@Injectable()
export class AlmacenService {

    constructor(@InjectModel(Almacen.name) private almacenModel: Model<Almacen>) { }


    // Crear un almacén
    async create(
        createAlmacenDto: CreateAlmacenDto,
    ): Promise<Almacen> {
        const existAlmacen = await this.almacenModel.findOne({
            nombre: createAlmacenDto.nombreAlmacen,
        });

        if (existAlmacen) {
            throw new BadRequestException('Ya existe el almacén');
        }
        const nuevoAlmacen = new this.almacenModel(createAlmacenDto);
        return nuevoAlmacen.save();
    }


    // Buscar todos los almacenes
    async findAll(): Promise<Almacen[]> {
        return this.almacenModel
            .find()
            .sort({ createdAt: -1 })
            .exec();
    }


    // Buscar un almacén
    async findOne(id: string): Promise<Almacen> {
        const alm = await this.almacenModel.findById(id).exec();
        if (!alm) {
            throw new NotFoundException('No se encontró el almacén');
        }
        return alm;
    }


    // Actualizar un almacén
    async update(id: string, updateAlmacenDto: UpdateAlmacenDto): Promise<Almacen> {
        const updatealm = await this.almacenModel.findByIdAndUpdate(id, updateAlmacenDto, { new: true }).exec();

        if (!updatealm) {
            throw new NotFoundException('No se encontró el almacén');
        }
        return updatealm;
    }


    // Eliminar un almacén

    async remove(id: string): Promise<void> {
        const deletealm = await this.almacenModel.findByIdAndDelete(id);

        if (!deletealm) {
            throw new NotFoundException('No se encontró el almacén');
        }
    }
}
