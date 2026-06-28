import { Injectable } from '@nestjs/common';
import { CreateCuentaDto } from './dto/create-cuenta.dto';
import { UpdateCuentaDto } from './dto/update-cuenta.dto';

@Injectable()
export class CuentaService {
  create(createCuentaDto: CreateCuentaDto) {
    return 'This action adds a new cuenta';
  }

  findAll() {
    return `This action returns all cuenta`;
  }

  findOne(id: string) {
    return `This action returns a #${id} cuenta`;
  }

  update(id: string, updateCuentaDto: UpdateCuentaDto) {
    return `This action updates a #${id} cuenta`;
  }

  remove(id: string) {
    return `This action removes a #${id} cuenta`;
  }
}
