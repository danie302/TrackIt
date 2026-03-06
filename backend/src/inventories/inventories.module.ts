import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventorySchema } from './schemas/inventory.schema';
import { InventoriesService } from './inventories.service';
import { InventoriesController } from './inventories.controller';
import { AuditsModule } from '../audits/audits.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Inventory', schema: InventorySchema }]),
    AuditsModule,
  ],
  controllers: [InventoriesController],
  providers: [InventoriesService],
  exports: [MongooseModule, InventoriesService],
})
export class InventoriesModule {}
