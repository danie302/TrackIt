import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CompaniesModule } from './companies/companies.module';
import { InventoriesModule } from './inventories/inventories.module';
import { ItemsModule } from './items/items.module';
import { OrdersModule } from './orders/orders.module';
import { AuditsModule } from './audits/audits.module';
import { CategoriesModule } from './categories/categories.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    UsersModule,
    CompaniesModule,
    InventoriesModule,
    ItemsModule,
    OrdersModule,
    AuditsModule,
    CategoriesModule,
    ConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
