import { Injectable } from '@nestjs/common';
import { CreateTasaDepreciacionDto } from './dto/create-tasa_depreciacion.dto';
import { UpdateTasaDepreciacionDto } from './dto/update-tasa_depreciacion.dto';

@Injectable()
export class TasaDepreciacionService {
  create(createTasaDepreciacionDto: CreateTasaDepreciacionDto) {
    return 'This action adds a new tasaDepreciacion';
  }

  findAll() {
    return `This action returns all tasaDepreciacion`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tasaDepreciacion`;
  }

  update(id: number, updateTasaDepreciacionDto: UpdateTasaDepreciacionDto) {
    return `This action updates a #${id} tasaDepreciacion`;
  }

  remove(id: number) {
    return `This action removes a #${id} tasaDepreciacion`;
  }
}
