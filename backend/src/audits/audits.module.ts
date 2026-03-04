import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditSchema } from './schemas/audit.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Audit', schema: AuditSchema }]),
  ],
  exports: [MongooseModule],
})
export class AuditsModule {}
