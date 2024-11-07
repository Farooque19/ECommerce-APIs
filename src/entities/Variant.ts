import {Entity, Column, ManyToOne} from "typeorm";
import {Product} from "./Product";
import {BaseEntity} from "./BaseEntity"

@Entity("Variant")
export class Variant extends BaseEntity {

    @Column("decimal")
    price: number;

    @Column({default: 0})
    inventory: number;

    @ManyToOne(() => Product, (product) => product.variant, {onDelete: "CASCADE"})
    product: Product;
}