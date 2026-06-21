import { PartialType } from '@nestjs/mapped-types';
import { CreateReportePlusDto } from './create-reporte_plus.dto';

export class UpdateReportePlusDto extends PartialType(CreateReportePlusDto) {}
