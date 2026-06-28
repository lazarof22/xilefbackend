import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateReporteCajaDto } from './dto/create-reporte_caja.dto';
import { UpdateReporteCajaDto } from './dto/update-reporte_caja.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ReporteCaja } from './schema/reporte_caja.schema';
import { Usuario } from '../../auth/schemas/empleado.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class ReporteCajaService {
    constructor(
        @InjectModel(ReporteCaja.name) private reporteCajaModel: Model<ReporteCaja>,
        @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>,
    ) { }

    async create(createReporteCajaDto: CreateReporteCajaDto): Promise<ReporteCaja> {
        const { empleado } = createReporteCajaDto;

        if (!Types.ObjectId.isValid(empleado)) {
            throw new BadRequestException('El ID del empleado no es válido');
        }

        const empleadoExist = await this.usuarioModel.findById(empleado);
        if (!empleadoExist) {
            throw new NotFoundException('El empleado no existe');
        }

        const nuevoReporte = new this.reporteCajaModel(createReporteCajaDto);
        return nuevoReporte.save();
    }

    async findAll(): Promise<ReporteCaja[]> {
        return this.reporteCajaModel
            .find()
            .populate({ path: 'empleado', select: 'nombre_empleado ci_empleado' })
            .sort({ createdAt: -1 })
            .exec();
    }

    async findOne(id: string): Promise<ReporteCaja> {
        const reporte = await this.reporteCajaModel
            .findById(id)
            .populate({ path: 'empleado', select: 'nombre_empleado ci_empleado' })
            .exec();

        if (!reporte) {
            throw new NotFoundException('No se encontró el reporte de caja');
        }
        return reporte;
    }

    async update(id: string, updateReporteCajaDto: UpdateReporteCajaDto): Promise<ReporteCaja> {
        if (updateReporteCajaDto.empleado) {
            const existe = await this.usuarioModel.findById(updateReporteCajaDto.empleado);
            if (!existe) throw new NotFoundException('El empleado no existe');
        }

        const updateReporte = await this.reporteCajaModel
            .findByIdAndUpdate(id, updateReporteCajaDto, { new: true })
            .exec();

        if (!updateReporte) {
            throw new NotFoundException('No se encontró el reporte de caja');
        }
        return updateReporte;
    }

    async remove(id: string): Promise<void> {
        const deleteReporte = await this.reporteCajaModel.findByIdAndDelete(id).exec();
        if (!deleteReporte) {
            throw new NotFoundException('No se encontró el reporte de caja');
        }
    }
}
