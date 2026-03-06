import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderRequestSchema } from './schemas/order-request.schema';
import { OrdersService } from './orders.service';
import { InventoriesModule } from '../inventories/inventories.module';
import { ItemsModule } from '../items/items.module';
import { AuditsModule } from '../audits/audits.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'OrderRequest', schema: OrderRequestSchema }]),
    InventoriesModule,
    ItemsModule,
    AuditsModule,
  ],
  providers: [OrdersService],
  exports: [MongooseModule, OrdersService],
})
export class OrdersModule {}
