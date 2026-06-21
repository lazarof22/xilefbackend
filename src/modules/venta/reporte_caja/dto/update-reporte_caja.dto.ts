import { PartialType } from '@nestjs/mapped-types';
import { CreateReporteCajaDto } from './create-reporte_caja.dto';

export class UpdateReporteCajaDto extends PartialType(CreateReporteCajaDto) {}
