import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateTransferenciaDto } from './dto/create-transferencia.dto';
import { UpdateTransferenciaDto } from './dto/update-transferencia.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Transferencia } from './schema/transferencia.schema';
import { Almacen } from '../almacen/schema/almacen.schema';
import { Contenedor } from '../contenedor/schema/contenedor.schema';
import { Producto } from '../producto/schemas/producto.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class TransferenciaService {
    constructor(
        @InjectModel(Transferencia.name) private transferenciaModel: Model<Transferencia>,
        @InjectModel(Almacen.name) private almacenModel: Model<Almacen>,
        @InjectModel(Contenedor.name) private contenedorModel: Model<Contenedor>,
        @InjectModel(Producto.name) private productoModel: Model<Producto>,
    ) { }

    async create(createTransferenciaDto: CreateTransferenciaDto): Promise<Transferencia> {
        const { almacen_origen, almacen_destino, contenedor_origen, contenedor_destino, producto, cantidad } = createTransferenciaDto;

        if (!Types.ObjectId.isValid(almacen_origen)) {
            throw new BadRequestException('El ID del almacén de origen no es válido');
        }
        if (!Types.ObjectId.isValid(almacen_destino)) {
            throw new BadRequestException('El ID del almacén de destino no es válido');
        }
        if (!Types.ObjectId.isValid(contenedor_origen)) {
            throw new BadRequestException('El ID del contenedor de origen no es válido');
        }
        if (!Types.ObjectId.isValid(contenedor_destino)) {
            throw new BadRequestException('El ID del contenedor de destino no es válido');
        }
        if (!Types.ObjectId.isValid(producto)) {
            throw new BadRequestException('El ID del producto no es válido');
        }

        const almacenOrigenExist = await this.almacenModel.findById(almacen_origen);
        if (!almacenOrigenExist) {
            throw new NotFoundException('El almacén de origen no existe');
        }
        const almacenDestinoExist = await this.almacenModel.findById(almacen_destino);
        if (!almacenDestinoExist) {
            throw new NotFoundException('El almacén de destino no existe');
        }

        const contenedorOrigenExist = await this.contenedorModel.findById(contenedor_origen);
        if (!contenedorOrigenExist) {
            throw new NotFoundException('El contenedor de origen no existe');
        }
        const contenedorDestinoExist = await this.contenedorModel.findById(contenedor_destino);
        if (!contenedorDestinoExist) {
            throw new NotFoundException('El contenedor de destino no existe');
        }

        const productoExist = await this.productoModel.findById(producto);
        if (!productoExist) {
            throw new NotFoundException('El producto no existe');
        }

        if (cantidad <= 0) {
            throw new BadRequestException('La cantidad debe ser mayor que cero');
        }

        const nuevaTransferencia = new this.transferenciaModel(createTransferenciaDto);
        return nuevaTransferencia.save();
    }

    async findAll(): Promise<Transferencia[]> {
        return this.transferenciaModel
            .find()
            .populate({ path: 'almacen_origen', select: 'nombreAlmacen' })
            .populate({ path: 'almacen_destino', select: 'nombreAlmacen' })
            .populate({ path: 'contenedor_origen', select: 'nombreContenedor' })
            .populate({ path: 'contenedor_destino', select: 'nombreContenedor' })
            .populate({ path: 'producto', select: 'nombre_producto codigo_producto' })
            .sort({ createdAt: -1 })
            .exec();
    }

    async findOne(id: string): Promise<Transferencia> {
        const transferencia = await this.transferenciaModel
            .findById(id)
            .populate({ path: 'almacen_origen', select: 'nombreAlmacen' })
            .populate({ path: 'almacen_destino', select: 'nombreAlmacen' })
            .populate({ path: 'contenedor_origen', select: 'nombreContenedor' })
            .populate({ path: 'contenedor_destino', select: 'nombreContenedor' })
            .populate({ path: 'producto', select: 'nombre_producto codigo_producto' })
            .exec();

        if (!transferencia) {
            throw new NotFoundException('No se encontró la transferencia');
        }
        return transferencia;
    }

    async update(id: string, updateTransferenciaDto: UpdateTransferenciaDto): Promise<Transferencia> {
        if (updateTransferenciaDto.almacen_origen) {
            const existe = await this.almacenModel.findById(updateTransferenciaDto.almacen_origen);
            if (!existe) throw new NotFoundException('El almacén de origen no existe');
        }
        if (updateTransferenciaDto.almacen_destino) {
            const existe = await this.almacenModel.findById(updateTransferenciaDto.almacen_destino);
            if (!existe) throw new NotFoundException('El almacén de destino no existe');
        }
        if (updateTransferenciaDto.contenedor_origen) {
            const existe = await this.contenedorModel.findById(updateTransferenciaDto.contenedor_origen);
            if (!existe) throw new NotFoundException('El contenedor de origen no existe');
        }
        if (updateTransferenciaDto.contenedor_destino) {
            const existe = await this.contenedorModel.findById(updateTransferenciaDto.contenedor_destino);
            if (!existe) throw new NotFoundException('El contenedor de destino no existe');
        }
        if (updateTransferenciaDto.producto) {
            const existe = await this.productoModel.findById(updateTransferenciaDto.producto);
            if (!existe) throw new NotFoundException('El producto no existe');
        }

        const updateTransferencia = await this.transferenciaModel
            .findByIdAndUpdate(id, updateTransferenciaDto, { new: true })
            .exec();

        if (!updateTransferencia) {
            throw new NotFoundException('No se encontró la transferencia');
        }
        return updateTransferencia;
    }

    async remove(id: string): Promise<void> {
        const deleteTransferencia = await this.transferenciaModel.findByIdAndDelete(id).exec();
        if (!deleteTransferencia) {
            throw new NotFoundException('No se encontró la transferencia');
        }
    }
}
