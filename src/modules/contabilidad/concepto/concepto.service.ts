import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateConceptoDto } from './dto/create-concepto.dto';
import { UpdateConceptoDto } from './dto/update-concepto.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Concepto } from './schema/concepto.schema';

@Injectable()
export class ConceptoService {
  constructor(@InjectModel(Concepto.name) private conceptoModel: Model<Concepto>) {

  }
  //Crear un concepto
  async create(
    createConceptoDto: CreateConceptoDto,
  ): Promise<Concepto> {
    const existC = await this.conceptoModel.findOne({
      nombreConcepto: createConceptoDto.nombreConcepto,
    });

    if (existC) {
      throw new BadRequestException('Ya existe el concepto');
    }
    const nuevoC = new this.conceptoModel(createConceptoDto);
    return nuevoC.save();
  }


  //Buscar todos los conceptos
  async findAll(): Promise<Concepto[]> {
    return this.conceptoModel
      .find()
      .sort({ createdAt: -1 })
      .exec();
  }


  // Buscar un concepto
  async findOne(id: string): Promise<Concepto> {
    const con = await this.conceptoModel.findById(id).exec();
    if (!con) {
      throw new NotFoundException('No se encontró el concepto');
    }
    return con;
  }

  //Actualizar un concepto
  async update(id: string, UpdateConceptoDto: UpdateConceptoDto): Promise<Concepto> {
    const updatec = await this.conceptoModel.findByIdAndUpdate(id, UpdateConceptoDto, { new: true }).exec();

    if (!updatec) {
      throw new NotFoundException('No se encontró el concepto');
    }
    return updatec;
  }

  //Eliminar un concepto

  async remove(id: string): Promise<void> {
    const deletec = await this.conceptoModel.findByIdAndDelete(id);

    if (!deletec) {
      throw new NotFoundException('No se encontró el concepto');
    }
  }
}
