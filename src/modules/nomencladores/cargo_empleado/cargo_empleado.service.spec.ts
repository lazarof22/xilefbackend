import { Test, TestingModule } from '@nestjs/testing';
import { CargoEmpleadoService } from './cargo_empleado.service';

describe('CargoEmpleadoService', () => {
  let service: CargoEmpleadoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CargoEmpleadoService],
    }).compile();

    service = module.get<CargoEmpleadoService>(CargoEmpleadoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
