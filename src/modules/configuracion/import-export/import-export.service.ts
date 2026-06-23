import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Producto,
  ProductoDocument,
} from '../../inventario/producto/schemas/producto.schema';
import { NomencladorHelper } from '../nomenclador-helper/nomenclador-helper.service';

interface CsvRow {
  codigo: string;
  nombre: string;
  precio_compra: string;
  precio_venta: string;
  stock_inicial: string;
  stock_minimo: string;
  categoria?: string;
  estado?: string;
}

@Injectable()
export class ImportExportService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Producto.name)
    private readonly productoModel: Model<ProductoDocument>,
    private readonly nomencladorHelper: NomencladorHelper,
  ) {}

  private parseCsv(csv: string): CsvRow[] {
    const lines = csv
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (lines.length < 2) {
      throw new BadRequestException('CSV vacío o sin datos');
    }
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const required = [
      'codigo',
      'nombre',
      'precio_compra',
      'precio_venta',
      'stock_inicial',
      'stock_minimo',
    ];
    for (const r of required) {
      if (!headers.includes(r)) {
        throw new BadRequestException(
          `Falta columna requerida: ${r}. Columnas: ${headers.join(', ')}`,
        );
      }
    }
    const rows: CsvRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      if (values.length < headers.length) continue;
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });
      rows.push(row as unknown as CsvRow);
    }
    return rows;
  }

  async importProductsFromCsv(csv: string): Promise<{ imported: number; errors: string[] }> {
    const rows = this.parseCsv(csv);
    let imported = 0;
    const errors: string[] = [];

    for (const row of rows) {
      try {
        if (!row.codigo || !row.nombre) {
          errors.push(`Fila inválida: código o nombre vacío`);
          continue;
        }
        const precioCompra = parseFloat(row.precio_compra);
        const precioVenta = parseFloat(row.precio_venta);
        const stockInicial = parseInt(row.stock_inicial, 10);
        const stockMinimo = parseInt(row.stock_minimo, 10);

        if (isNaN(precioCompra) || isNaN(precioVenta)) {
          errors.push(`Precios inválidos en: ${row.codigo}`);
          continue;
        }

        let categoriaId;
        if (row.categoria) {
          categoriaId = await this.nomencladorHelper.findOrCreateCategoria(row.categoria);
        }

        let estadoId;
        if (row.estado) {
          estadoId = await this.nomencladorHelper.findOrCreateEstado(row.estado);
        }

        const existing = await this.productoModel.findOne({
          codigo_producto: row.codigo,
        });
        if (existing) {
          existing.nombre_producto = row.nombre;
          existing.precio_compra = precioCompra;
          existing.precio_venta = precioVenta;
          existing.stock_inicial = stockInicial;
          existing.stock_minimo = stockMinimo;
          if (categoriaId) existing.categoria_producto = categoriaId;
          if (estadoId) existing.estado = estadoId;
          await existing.save();
        } else {
          await this.productoModel.create({
            codigo_producto: row.codigo,
            nombre_producto: row.nombre,
            precio_compra: precioCompra,
            precio_venta: precioVenta,
            stock_inicial: stockInicial,
            stock_minimo: stockMinimo,
            categoria_producto: categoriaId,
            estado: estadoId,
          });
        }
        imported++;
      } catch (err: any) {
        errors.push(`${row.codigo}: ${err.message}`);
      }
    }
    return { imported, errors };
  }

  async exportAllToJson(): Promise<Record<string, unknown[]>> {
    const collections = await this.connection.db!.listCollections().toArray();
    const result: Record<string, unknown[]> = {};

    for (const col of collections) {
      const name = col.name;
      const docs = await this.connection.db!.collection(name).find().toArray();
      result[name] = docs.map((doc) => {
        const { _id, __v, ...rest } = doc as Record<string, unknown>;
        return rest;
      });
    }
    return result;
  }

  async importFromJson(
    data: Record<string, unknown[]>,
  ): Promise<{ imported: number; errors: string[] }> {
    const errors: string[] = [];
    let imported = 0;

    for (const [collectionName, docs] of Object.entries(data)) {
      if (!Array.isArray(docs)) continue;
      try {
        const collection = this.connection.db!.collection(collectionName);
        for (const doc of docs) {
          try {
            await collection.insertOne(doc as any);
            imported++;
          } catch (err: any) {
            errors.push(`${collectionName}: ${err.message}`);
          }
        }
      } catch (err: any) {
        errors.push(`${collectionName}: ${err.message}`);
      }
    }
    return { imported, errors };
  }
}
