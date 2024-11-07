import {
    Column,
    Entity,
    ManyToOne,
    OneToMany,
} from 'typeorm';
import { Client } from "./Client";
import { Variant } from "./Variant";
import { BaseEntity } from "./BaseEntity"
import { Options } from "../config/Type";

@Entity("Products")
export class Product extends BaseEntity {

    @Column()
    description: string;

    @Column("json", { nullable: true })
    options?: Options;

    @ManyToOne(() => Client, client => client.products, {onDelete: "CASCADE"})
    client: Client;

    @OneToMany(() => Variant, (variant) => variant.product, {cascade: true})
    variant: Variant[];
}