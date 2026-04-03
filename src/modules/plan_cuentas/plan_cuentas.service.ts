import { Injectable } from '@nestjs/common';
import { CreatePlanCuentaDto } from './dto/create-plan_cuenta.dto';
import { UpdatePlanCuentaDto } from './dto/update-plan_cuenta.dto';

@Injectable()
export class PlanCuentasService {
  create(createPlanCuentaDto: CreatePlanCuentaDto) {
    return 'This action adds a new planCuenta';
  }

  findAll() {
    return `This action returns all planCuentas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} planCuenta`;
  }

  update(id: number, updatePlanCuentaDto: UpdatePlanCuentaDto) {
    return `This action updates a #${id} planCuenta`;
  }

  remove(id: number) {
    return `This action removes a #${id} planCuenta`;
  }
}
