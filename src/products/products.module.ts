import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';

import { ProductsController } from './products.controller';
import { ProductImage } from './entities/product-images.entity';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage]),
  ],
  exports:[
    ProductsService,
    TypeOrmModule
  ]
})
export class ProductsModule {}
