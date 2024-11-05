import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn} from "typeorm";
import {Product} from "./Product";

@Entity("Variant")
export class Variant {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("varchar")
    name: string;

    @Column("decimal")
    price: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({default: 0})
    inventory: number;

    @ManyToOne(() => Product, (product) => product.variant)
    product: Product | null;
}