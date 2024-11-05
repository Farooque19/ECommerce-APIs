import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { Client } from "./Client";
import { Variant } from "./Variant";

@Entity("Products")
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("varchar")
    name: string;

    @Column("text")
    description: string;

    @Column("json", { nullable: true })
    options?: { [key: string]: string[] };

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Client, (client) => client.products)
    client: Client | null;

    @OneToMany(() => Variant, (variant) => variant.product, {cascade: true})
    variant: Variant[];
}