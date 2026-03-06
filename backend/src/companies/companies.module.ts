import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanySchema } from './schemas/company.schema';
import { CompaniesService } from './companies.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Company', schema: CompanySchema }]),
    UsersModule,
  ],
  providers: [CompaniesService],
  exports: [MongooseModule, CompaniesService],
})
export class CompaniesModule {}
