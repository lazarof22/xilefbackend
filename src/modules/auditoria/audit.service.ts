/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog } from './schema/audit-log.schema';
import {
  AuditEvento,
  AccionAuditoria,
  ModuloAuditoria,
} from './types/auditoria.types';

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLog>,
  ) {}

  async registrar(evento: AuditEvento): Promise<AuditLog> {
    const registro = new this.auditLogModel(evento);
    return registro.save();
  }

  async findAll(
    filtros: {
      entidad?: string;
      usuarioId?: string;
      accion?: AccionAuditoria;
      modulo?: ModuloAuditoria;
      fechaDesde?: Date;
      fechaHasta?: Date;
      limit?: number;
    } = {},
  ): Promise<AuditLog[]> {
    const query: any = {};

    if (filtros.entidad) query.entidad = filtros.entidad;
    if (filtros.usuarioId) query.usuarioId = filtros.usuarioId;
    if (filtros.accion) query.accion = filtros.accion;
    if (filtros.modulo) query.modulo = filtros.modulo;
    if (filtros.fechaDesde || filtros.fechaHasta) {
      query.createdAt = {};
      if (filtros.fechaDesde) query.createdAt.$gte = filtros.fechaDesde;
      if (filtros.fechaHasta) query.createdAt.$lte = filtros.fechaHasta;
    }

    return this.auditLogModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(filtros.limit || 100)
      .exec();
  }

  async findByEntidad(
    entidad: string,
    entidadId?: string,
  ): Promise<AuditLog[]> {
    const query: any = { entidad };
    if (entidadId) query.entidadId = entidadId;
    return this.auditLogModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<AuditLog | null> {
    return this.auditLogModel.findById(id).exec();
  }

  async resumenPorModulo(fechaDesde?: Date, fechaHasta?: Date): Promise<any[]> {
    const match: any = {};
    if (fechaDesde || fechaHasta) {
      match.createdAt = {};
      if (fechaDesde) match.createdAt.$gte = fechaDesde;
      if (fechaHasta) match.createdAt.$lte = fechaHasta;
    }

    return this.auditLogModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$modulo',
          total: { $sum: 1 },
          acciones: { $push: '$accion' },
        },
      },
      { $sort: { total: -1 } },
    ]);
  }
}
