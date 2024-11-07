import {DataSource} from "typeorm";
import {Client} from "../entities/Client";
import {Variant} from "../entities/Variant";
import {Product} from "../entities/Product";

export class DBConnection {
    protected connection: any | undefined = undefined;

    private postgresDataSource = new DataSource({
        type: "postgres",
        host: "localhost",
        port: 5432,
        username: "postgres",
        password: "asdf",
        database: "ecommerce",
        entities: [Client, Product, Variant],
        synchronize: true,
    });

    constructor() {
        this.connection = this.postgresDataSource;
    }

    async connect() {
        this.connection = await this.postgresDataSource.initialize();
        if (this.connection) {
            console.log("Database Connected");
            return this.postgresDataSource;
        } else {
            throw new Error("Database Connection failed");
        }
    }
}
