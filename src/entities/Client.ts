import {Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';
import {Product} from "./Product";

@Entity("Client")
export class Client {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    email: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Product, (product) => product.client, {cascade: true})
    products: Product[];
}