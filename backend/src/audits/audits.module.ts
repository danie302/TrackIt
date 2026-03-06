import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditSchema } from './schemas/audit.schema';
import { AuditsService } from './audits.service';
import { AuditsController } from './audits.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Audit', schema: AuditSchema }]),
  ],
  controllers: [AuditsController],
  providers: [AuditsService],
  exports: [MongooseModule, AuditsService],
})
export class AuditsModule {}
