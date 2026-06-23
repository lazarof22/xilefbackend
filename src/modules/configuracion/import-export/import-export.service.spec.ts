import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { ImportExportService } from './import-export.service';
import { Producto } from '../../inventario/producto/schemas/producto.schema';

describe('ImportExportService', () => {
  let service: ImportExportService;
  let mockProductoModel: any;
  let mockConnection: any;

  beforeEach(async () => {
    mockProductoModel = {
      findOne: jest.fn(),
      create: jest.fn(),
    };

    mockConnection = {
      db: {
        listCollections: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([]) }),
        collection: jest.fn().mockReturnValue({
          find: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([]) }),
          insertOne: jest.fn().mockResolvedValue({ insertedId: 'abc' }),
        }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImportExportService,
        { provide: getModelToken(Producto.name), useValue: mockProductoModel },
        { provide: getConnectionToken(), useValue: mockConnection },
      ],
    }).compile();

    service = module.get<ImportExportService>(ImportExportService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('importProductsFromCsv', () => {
    it('should parse and import CSV products', async () => {
      const csv = `codigo,nombre,precio_compra,precio_venta,stock_inicial,stock_minimo
P001,Producto 1,100,150,50,10
P002,Producto 2,200,300,30,5`;

      mockProductoModel.findOne.mockResolvedValue(null);
      mockProductoModel.create.mockResolvedValue({});

      const result = await service.importProductsFromCsv(csv);
      expect(result.imported).toBe(2);
      expect(mockProductoModel.create).toHaveBeenCalledTimes(2);
    });

    it('should update existing products', async () => {
      const csv = `codigo,nombre,precio_compra,precio_venta,stock_inicial,stock_minimo
P001,Updated,100,150,50,10`;

      const existing = { nombre_producto: 'Old', save: jest.fn().mockResolvedValue(true) };
      mockProductoModel.findOne.mockResolvedValue(existing);

      const result = await service.importProductsFromCsv(csv);
      expect(result.imported).toBe(1);
      expect(existing.save).toHaveBeenCalled();
    });

    it('should reject CSV with missing columns', async () => {
      const csv = `codigo,nombre
P001,Producto`;

      await expect(service.importProductsFromCsv(csv)).rejects.toThrow();
    });

    it('should return empty for empty CSV', async () => {
      await expect(service.importProductsFromCsv('')).rejects.toThrow();
    });
  });

  describe('exportAllToJson', () => {
    it('should export all collections', async () => {
      mockConnection.db.listCollections().toArray.mockResolvedValue([
        { name: 'productos' },
      ]);
      mockConnection.db.collection().find().toArray.mockResolvedValue([
        { _id: 'abc', nombre: 'P1', __v: 0 },
      ]);
      const result = await service.exportAllToJson();
      expect(result.productos).toBeDefined();
    });
  });

  describe('importFromJson', () => {
    it('should import data into collections', async () => {
      const data = { productos: [{ nombre: 'P1' }] };
      const result = await service.importFromJson(data);
      expect(result.imported).toBe(1);
    });
  });
});
