import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventorySchema } from './schemas/inventory.schema';
import { InventoriesService } from './inventories.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Inventory', schema: InventorySchema }]),
  ],
  providers: [InventoriesService],
  exports: [MongooseModule, InventoriesService],
})
export class InventoriesModule {}
