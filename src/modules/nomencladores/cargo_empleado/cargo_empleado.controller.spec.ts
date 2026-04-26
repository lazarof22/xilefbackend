import { Test, TestingModule } from '@nestjs/testing';
import { CargoEmpleadoController } from './cargo_empleado.controller';
import { CargoEmpleadoService } from './cargo_empleado.service';

describe('CargoEmpleadoController', () => {
  let controller: CargoEmpleadoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CargoEmpleadoController],
      providers: [CargoEmpleadoService],
    }).compile();

    controller = module.get<CargoEmpleadoController>(CargoEmpleadoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
