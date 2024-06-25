import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-images.entity";

@Entity()
export class Product {

@PrimaryGeneratedColumn('uuid')
id: string;

@Column('text',{ 
  unique: true,
})
title: string

@Column('float',{
  default:0
})
price: number

@Column({
  type: 'text',
  nullable: true
})
descripton: string


@Column({
  type: 'text',
  unique: true
})
slug: string

@Column({
  type: 'int',
  default: 0
})
stock: number


@Column({
  type: 'text',
  array: true
})
sizes: string[];

@Column({
  type: 'text'
})
gender:  'men' | 'women' | 'kid' | 'unisex'


//tags
@Column({
  type: 'text',
  array: true,
  default:[]
})
tags: string[]
//images

@OneToMany(
  () => ProductImage,
  (productImage) => productImage.product,
  {
    cascade: true,
  }
)

images?: ProductImage

@BeforeInsert()
checkSlugInsert(){

  if(!this.slug){
    this.slug = this.title
  }

  this.slug = this.slug
  .toLowerCase()
  .replaceAll(' ', '_')
  .replaceAll("'", '')
}

@BeforeUpdate()
checkSlugUpdate(){
  this.slug = this.slug
  .toLowerCase()
  .replaceAll(' ', '_')
  .replaceAll("'", '')
}
}
