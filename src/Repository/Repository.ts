import { Repository } from "typeorm";
import { Client } from "../entities/Client";
import { Product } from "../entities/Product";
import { Variant } from "../entities/Variant";
import { DBConnection } from "../db/DBConnection";

const dbConnect = new DBConnection(); // Use the singleton instance
// Function to retrieve the Client repository
export const getClientRepository = async (): Promise<Repository<Client>> => {
    const db = await dbConnect.connect();
    return db.getRepository(Client);
};

// Function to retrieve the Product repository
export const getProductRepository = async (): Promise<Repository<Product>> => {
    const db = await dbConnect.connect();
    return db.getRepository(Product);
};

// Function to retrieve the Variant repository
export const getVariantRepository = async (): Promise<Repository<Variant>> => {
    const db = await dbConnect.connect();
    return db.getRepository(Variant);
};
