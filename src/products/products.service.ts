import { BadRequestException, Injectable, InternalServerErrorException, Logger, ParseUUIDPipe } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { validate as isUUID } from 'uuid'
import { ProductImage } from './entities/product-images.entity';

@Injectable()
export class ProductsService {

  
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly ProductImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource

  ) {}


  async create(createProductDto: CreateProductDto) {
    try {
      const {images=[], ...ProductsDetails } = createProductDto

      const product = this.productRepository.create({
        ...createProductDto,
        images: images.map(image => this.ProductImageRepository.create({url:image}))
      });

      await this.productRepository.save(product);

      return {
        ...product,
        images: product.images.map(image => image.url)
      }

      
    } catch (error) {
      if(error.code === '23505') 
        this.handleDBExceptions(error)
    }
  }

  async findAll(PaginationDto: PaginationDto) {
     const { limit = 10, offset = 0 } = PaginationDto

      const products = await this.productRepository.find({
        take: limit,
        skip: offset,
        relations: {
          images: true
        },
        order: {
          price: 'DESC'
        }
      })


       return {
        products: products.map(product => ({
          ...product,
          images: product.images.map(image => image.url)
        })),
        total: products.length
       }
    // TODO: relaciones
    // return this.productRepository.find().
  }

  async findOne(term: string) {

     let product: Product

     if  (isUUID(term)){
      product = await this.productRepository.findOneBy({id: term})

     }else{
      
      const queryBuilder = this.productRepository.createQueryBuilder('prod')
        product = await queryBuilder
        .where( ' UPPER(title)=:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase() 
        })
        .leftJoinAndSelect('prod.images','prodImages')
        .getOne()
     }
    
      if(!product) 
        throw new BadRequestException(`Product with id: ${term} not found`)
      return product
  }

  async findOnePlain(term:string){
    try {
      const {images = [],...rest} = await this.findOne(term)
      return {
        ...rest,
        images: images.map(image => image.url)
      }
    } catch (error) {
      this.handleDBExceptions(error)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const {images,...toUpdate} = updateProductDto

    

    const product = await this.productRepository.preload({ 
      id, 
      ...toUpdate
    })

    if(!product){
      throw new BadRequestException(`Product with id: ${id} not found`)
    }

    //create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect()
    await queryRunner.startTransaction()




    try {
      if(images){
        await queryRunner.manager.delete(ProductImage,{product:{id:id}} )

        product.images = images.map(
          image => this.ProductImageRepository.create({url:image})
        )
      }else{
        /// ???
        // product.images = []
      }
      await queryRunner.manager.save(product)
      //await this.productRepository.save(product)

      await queryRunner.commitTransaction() // hace el comir
      await queryRunner.release() // ya no se conecta mas
      return this.findOnePlain(id);

    } catch (error) {
      await queryRunner.rollbackTransaction(); // es caso de error regresa los cambios
      await queryRunner.release()
      return this.handleDBExceptions(error)
    }
  }

  async remove(id: string) {
   
      const product = await this.findOne(id)
      await this.productRepository.remove(product)
      return { message: `Product with id: ${id} deleted` }

  }

  private handleDBExceptions(error: any){
    if(error.code === '23505') 
      throw new BadRequestException(error.detail)
    
    this.logger.error(error)
    throw new InternalServerErrorException('check server logs')
  }
  async deleteAllProducts(){
    const query = this.productRepository.createQueryBuilder('product');
    try {
      return await query
      .delete()
      .where({})
      .execute()
    } catch (error) {
      this.handleDBExceptions(error)
    }
  }
}
