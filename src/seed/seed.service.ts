import { All, Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {

  constructor(private readonly productsService:ProductsService){}

  async runSeed(){
      await this.inserNewProducts()
      return { message: 'Seeding process finished'}
  }

  private async inserNewProducts(){
    await  this.productsService.deleteAllProducts();

    const insertPromisesProducts = []
    
    for (const product of initialData.products) {
     insertPromisesProducts.push(this.productsService.create(product))
    }

    await Promise.all(insertPromisesProducts)
    .then(() => console.log('Products inserted successfully'))
  }
}
