import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateReportePlusDto } from './dto/create-reporte_plus.dto';
import { UpdateReportePlusDto } from './dto/update-reporte_plus.dto';
import { ReportePlus } from './schema/reporte_plus.schema';
import { Kardex, KardexTipo } from '../../inventario/kardex/schema/kardex.schema';

@Injectable()
export class ReportePlusService {
  constructor(
    @InjectModel(ReportePlus.name) private reportePlusModel: Model<ReportePlus>,
    @InjectModel(Kardex.name) private kardexModel: Model<Kardex>,
  ) {}


  async findAll(): Promise<ReportePlus[]> {
      return this.reportePlusModel
        .find()
        .populate('productoId', 'nombre_producto precio')
        .sort({ createdAt: -1 })
        .exec();
    }

  async consolidarDelDia(): Promise<{ movimientos: number; mensaje: string }> {
    // Obtener TODOS los reportes plus (sin filtro de fecha)
    const reportesPlus = await this.reportePlusModel.find().exec();

    console.log('Reportes encontrados:', reportesPlus.length);

    // Si no hay reportes, retornar sin hacer nada
    if (reportesPlus.length === 0) {
      return {
        movimientos: 0,
        mensaje: 'No hay reportes plus para consolidar',
      };
    }

    // Transferir cada reporte plus al kardex
    let movimientosCreados = 0;
    for (const reportePlus of reportesPlus) {
      await this.kardexModel.create({
        fecha: reportePlus.fecha,
        productoId: reportePlus.productoId,
        tipo: KardexTipo.VENTA,
        cantidad: reportePlus.cantidad,
        stock: reportePlus.stockfinal,
        motivo: `Venta - Descuento: ${reportePlus.descuento} - Total: ${reportePlus.totalPagado}`,
      });
      movimientosCreados++;
    }

    // Eliminar TODOS los reportes plus
    const resultado = await this.reportePlusModel.deleteMany({});

    console.log('Registros eliminados:', resultado.deletedCount);

    return {
      movimientos: movimientosCreados,
      mensaje: `Se consolidaron ${movimientosCreados} movimientos al kardex y se eliminaron ${resultado.deletedCount} registros`,
    };
  }
}
