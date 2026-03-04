import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderRequestSchema } from './schemas/order-request.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'OrderRequest', schema: OrderRequestSchema }]),
  ],
  exports: [MongooseModule],
})
export class OrdersModule {}
