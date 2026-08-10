import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLog, AuditLogSchema } from './schema/audit-log.schema';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditInterceptor } from './interceptors/audit.interceptor';

@Module({
  controllers: [AuditController],
  providers: [
    AuditService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
  imports: [
    MongooseModule.forFeature([
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  exports: [AuditService, MongooseModule],
})
export class AuditModule {}
