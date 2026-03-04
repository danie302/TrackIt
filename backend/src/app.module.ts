import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { UsersModule } from './users/users.module';
import { CompaniesModule } from './companies/companies.module';
import { InventoriesModule } from './inventories/inventories.module';
import { ItemsModule } from './items/items.module';
import { OrdersModule } from './orders/orders.module';
import { AuditsModule } from './audits/audits.module';
import { CategoriesModule } from './categories/categories.module';
import { ConfigModule } from './config/config.module';
import { getDatabaseConfig } from './config/database.config';
import { getRedisConfig } from './config/redis.config';
import { validate } from './config/env.validation';
import { HealthModule } from './health/health.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    CacheModule.registerAsync(getRedisConfig()),
    EmailModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
    InventoriesModule,
    ItemsModule,
    OrdersModule,
    AuditsModule,
    CategoriesModule,
    ConfigModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
