import { Injectable } from '@nestjs/common';
import { CreateActivoFijoDto } from './dto/create-activo_fijo.dto';
import { UpdateActivoFijoDto } from './dto/update-activo_fijo.dto';

@Injectable()
export class ActivoFijoService {
  create(createActivoFijoDto: CreateActivoFijoDto) {
    return 'This action adds a new activoFijo';
  }

  findAll() {
    return `This action returns all activoFijo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} activoFijo`;
  }

  update(id: number, updateActivoFijoDto: UpdateActivoFijoDto) {
    return `This action updates a #${id} activoFijo`;
  }

  remove(id: number) {
    return `This action removes a #${id} activoFijo`;
  }
}
