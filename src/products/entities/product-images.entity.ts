import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity()
export class ProductImage {

@PrimaryGeneratedColumn()
id: number;

@Column('text')
url:string

@ManyToOne(
    () => Product,
    (product) => product.images,
)
product: Product


@CreateDateColumn()
public created_at: Date;

@UpdateDateColumn()
public updated_at: Date;

}
