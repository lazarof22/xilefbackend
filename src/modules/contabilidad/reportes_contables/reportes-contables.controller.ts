import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReportesContablesService } from './reportes-contables.service';
import { FiltroReporteDto } from './dto/filtro-reporte.dto';

@ApiTags('Reportes Contables')
@Controller('reportes-contables')
export class ReportesContablesController {
  constructor(
    private readonly reportesContablesService: ReportesContablesService,
  ) {}

  @Get('estado-rendimiento')
  @ApiOperation({
    summary: 'Estado de rendimiento: ingresos y gastos del período',
  })
  @ApiResponse({ status: 200, description: 'Líneas y resumen del período' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  estadoRendimiento(@Query() filtro: FiltroReporteDto) {
    return this.reportesContablesService.estadoRendimiento(filtro);
  }

  @Get('gastos-elementos')
  @ApiOperation({ summary: 'Gastos por elementos del gasto del período' })
  @ApiResponse({ status: 200, description: 'Gastos agrupados por elemento' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  gastosPorElementos(@Query() filtro: FiltroReporteDto) {
    return this.reportesContablesService.gastosPorElementos(filtro);
  }

  @Get('balance-comprobacion')
  @ApiOperation({
    summary: 'Balance de comprobación: sumas y saldos del período',
  })
  @ApiResponse({ status: 200, description: 'Líneas y resumen del balance' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  balanceComprobacion(@Query() filtro: FiltroReporteDto) {
    return this.reportesContablesService.balanceComprobacion(filtro);
  }

  @Get('submayor')
  @ApiOperation({ summary: 'Submayor (mayor auxiliar) de una cuenta' })
  @ApiResponse({ status: 200, description: 'Movimientos y saldo de la cuenta' })
  @ApiResponse({
    status: 400,
    description: 'Falta cuentaId o la cuenta no existe',
  })
  submayor(@Query() filtro: FiltroReporteDto) {
    return this.reportesContablesService.submayor(filtro);
  }
}
