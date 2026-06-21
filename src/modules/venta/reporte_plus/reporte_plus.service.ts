import { Injectable } from '@nestjs/common';
import { CreateReportePlusDto } from './dto/create-reporte_plus.dto';
import { UpdateReportePlusDto } from './dto/update-reporte_plus.dto';

@Injectable()
export class ReportePlusService {
  create(createReportePlusDto: CreateReportePlusDto) {
    return 'This action adds a new reportePlus';
  }

  findAll() {
    return `This action returns all reportePlus`;
  }

  findOne(id: number) {
    return `This action returns a #${id} reportePlus`;
  }

  update(id: number, updateReportePlusDto: UpdateReportePlusDto) {
    return `This action updates a #${id} reportePlus`;
  }

  remove(id: number) {
    return `This action removes a #${id} reportePlus`;
  }
}
