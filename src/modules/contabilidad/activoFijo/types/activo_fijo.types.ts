import { Types } from 'mongoose';

export interface DepreciacionResult {
  depreciacionAnual: number;
  depreciacionMensual: number;
  depreciacionAcumulada: number;
  valorEnLibros: number;
  fechaUltimaDepreciacion: Date;
}

export interface BajaDto {
  fechaBaja: string;
  motivoBaja: string;
  tipoBaja: string;
  valorBaja: number;
  documentoBaja?: string;
}

export interface RevaluacionDto {
  fechaRevaluacion: string;
  valorAvaluo: number;
  entidadAvaluadora: string;
  documentoRevaluacion?: string;
}

export interface Estadisticas {
  totalActivos: number;
  totalBajas: number;
  valorAdquisicionTotal: number;
  depreciacionAcumuladaTotal: number;
  valorEnLibrosTotal: number;
  porEstado: { _id: Types.ObjectId; count: number }[];
  porArea: { _id: Types.ObjectId; count: number; totalValor: number }[];
}

export interface ActivosPorEstadoItem {
  _id: Types.ObjectId;
  cantidad: number;
  valorAdquisicionTotal: number;
  valorLibrosTotal: number;
  depreciacionTotal: number;
}

export interface ResumenEconomicoGeneral {
  totalActivos: number;
  activosVigentes: number;
  activosBaja: number;
  porcentajeBaja: number;
}

export interface ResumenEconomicoValores {
  valorAdquisicionTotal: number;
  valorResidualTotal: number;
  depreciacionAcumuladaTotal: number;
  valorLibrosTotal: number;
  revaluacionAcumuladaTotal: number;
  porcentajeDepreciado: number;
}

export interface ResumenEconomico {
  resumenGeneral: ResumenEconomicoGeneral;
  resumenValores: ResumenEconomicoValores;
}

export interface DepreciacionScheduleItem {
  codigoActivo: string;
  descripcionActivo: string;
  valorAdquisicion: number;
  valorResidual: number;
  vidaUtil: number;
  depreciacionAnual: number;
  depreciacionMensual: number;
  depreciacionAcumulada: number;
  valorEnLibros: number;
  fechaCompra: Date;
  anosTranscurridos: number;
}

export interface ActivoCreadoResumen {
  _id: Types.ObjectId;
  codigoActivo: string;
  descripcionActivo: string;
}

export interface CreacionMasivaResponse {
  creados: number;
  activos: ActivoCreadoResumen[];
}

export type CreateActivoResult = ActivoFijoExport | CreacionMasivaResponse;

export interface DepreciacionAnualResponse {
  activo: string;
  descripcion: string;
  costoAdquisicion: number;
  valorResidual: number;
  vidaUtilAnios: number;
  depreciacionAnual: number;
}

export interface DepreciacionMensualResponse extends DepreciacionAnualResponse {
  fechaCompra: Date;
  depreciacionMensual: number;
  depreciacionAcumulada: number;
  valorEnLibros: number;
  fechaUltimaDepreciacion: Date;
}

export type PopulatedRef = Types.ObjectId | Record<string, unknown>;

export interface ActivoFijoExport {
  codigoActivo: string;
  descripcionActivo: string;
  marca?: string;
  modelo?: string;
  numeroSerie?: string;
  proveedor: PopulatedRef;
  area: PopulatedRef;
  grupoActivo?: PopulatedRef;
  fechaCompra: Date;
  fechaPuestaMarcha?: Date;
  valorAdquisicion: number;
  valorResidual: number;
  vidaUtil: number;
  tasaDepreciacion: PopulatedRef;
  metodoDepreciacion: string;
  depreciacionAnual: number;
  depreciacionMensual: number;
  depreciacionAcumulada: number;
  valorEnLibros: number;
  moneda: PopulatedRef;
  pais?: PopulatedRef;
  concepto?: PopulatedRef;
  estadoActivo: PopulatedRef;
  cuentaDebe?: PopulatedRef;
  cuentaHaber?: PopulatedRef;
  cuentaDepreciacion?: PopulatedRef;
  numeroFactura?: string;
  ordenCompra?: string;
  observaciones?: string;
  ajusteValor: number;
  fechaUltimaDepreciacion?: Date;
  activo: boolean;
  fechaBaja?: Date;
  motivoBaja?: string;
  valorBaja?: number;
  tipoBaja?: string;
  documentoBaja?: string;
  gananciaPerdidaBaja?: number;
  revaluacionAcumulada: number;
  fechaUltimaRevaluacion?: Date;
  valorAvaluo?: number;
  entidadAvaluadora?: string;
}

export interface DeleteResponse {
  deleted: boolean;
}

export interface RecalcularMasivoResponse {
  modificados: number;
}
