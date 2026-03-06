import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanySchema } from './schemas/company.schema';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { UsersModule } from '../users/users.module';
import { AuditsModule } from '../audits/audits.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Company', schema: CompanySchema }]),
    UsersModule,
    AuditsModule,
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService],
  exports: [MongooseModule, CompaniesService],
})
export class CompaniesModule {}
