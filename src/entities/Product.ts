import {
    Column,
    Entity,
    ManyToOne,
    OneToMany,
} from 'typeorm';
import {Client} from "./Client";
import {Variant} from "./Variant";
import {BaseEntity} from "./BaseEntity"

@Entity("Products")
export class Product extends BaseEntity {

    @Column()
    description: string;

    @ManyToOne(() => Client, client => client.products, {onDelete: "CASCADE", nullable: false})
    client: Client;

    @OneToMany(() => Variant, (variant) => variant.product, {cascade: true})
    variant: Variant[];
}