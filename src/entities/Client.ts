import {Column, Entity, OneToMany} from 'typeorm';
import {Product} from "./Product";
import { BaseEntity } from "./baseEntity"

@Entity("Client")
export class Client extends BaseEntity{

    @Column()
    email: string;

    @OneToMany(() => Product, (product) => product.client, {cascade: true})
    products: Product[];
}