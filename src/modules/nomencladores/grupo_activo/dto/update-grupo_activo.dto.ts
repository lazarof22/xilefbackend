import { PartialType } from '@nestjs/swagger';
import { CreateGrupoActivoDto } from './create-grupo_activo.dto';

export class UpdateGrupoActivoDto extends PartialType(CreateGrupoActivoDto) {}
