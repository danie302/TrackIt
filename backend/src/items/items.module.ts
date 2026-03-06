import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ItemSchema } from './schemas/item.schema';
import { ItemsService } from './items.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Item', schema: ItemSchema }]),
  ],
  providers: [ItemsService],
  exports: [MongooseModule, ItemsService],
})
export class ItemsModule {}
