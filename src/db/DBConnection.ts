import { DataSource } from "typeorm";
import { Client } from "../entities/Client";
import { Variant } from "../entities/Variant";
import { Product } from "../entities/Product";

export class DBConnection {
    private connection: DataSource | undefined = undefined;

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
        this.connection = undefined;
    }

    public async connect(): Promise<DataSource> {
        // Check if connection is already established
        if (this.connection?.isInitialized) {
            console.log("Reusing existing database connection");
            return this.connection;
        }

        // Initialize connection if not already done
        this.connection = await this.postgresDataSource.initialize();
        console.log("Database connected");
        return this.connection;
    }
}
