import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ItemSchema } from './schemas/item.schema';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { AuditsModule } from '../audits/audits.module';
import { InventoriesModule } from '../inventories/inventories.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Item', schema: ItemSchema }]),
    AuditsModule,
    InventoriesModule,
  ],
  controllers: [ItemsController],
  providers: [ItemsService],
  exports: [MongooseModule, ItemsService],
})
export class ItemsModule {}
