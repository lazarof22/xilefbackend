import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EnzonaService } from './enzona.service';
import { EnzonaWebhookDto } from './dto/enzona-webhook.dto';

@ApiTags('Enzona - Pasarela de Pago')
@Controller('enzona')
export class EnzonaController {
  constructor(private readonly enzonaService: EnzonaService) {}

  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Webhook para pagos de Enzona' })
  @ApiResponse({ status: 200, description: 'Webhook procesado' })
  async webhook(@Body() payload: EnzonaWebhookDto) {
    return this.enzonaService.procesarWebhook(payload);
  }
}
