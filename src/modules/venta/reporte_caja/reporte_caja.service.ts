import { Injectable } from '@nestjs/common';
import { CreateReporteCajaDto } from './dto/create-reporte_caja.dto';
import { UpdateReporteCajaDto } from './dto/update-reporte_caja.dto';

@Injectable()
export class ReporteCajaService {
  create(createReporteCajaDto: CreateReporteCajaDto) {
    return 'This action adds a new reporteCaja';
  }

  findAll() {
    return `This action returns all reporteCaja`;
  }

  findOne(id: number) {
    return `This action returns a #${id} reporteCaja`;
  }

  update(id: number, updateReporteCajaDto: UpdateReporteCajaDto) {
    return `This action updates a #${id} reporteCaja`;
  }

  remove(id: number) {
    return `This action removes a #${id} reporteCaja`;
  }
}
