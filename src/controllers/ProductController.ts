import { Client } from "../entities/Client";
import { DBConnection } from "../db/dbConnection";
import { IRouterContext } from "koa-router";
import { Product } from "../entities/Product";
import { Options } from "../config/type";

const dbConnect = new DBConnection();

export class ProductController {
    protected productDataRepo : any;
    constructor(connection: any) {
        this.productDataRepo = connection.getRepository(Product);
    }

    // Create Product for a Client
    public async createProductForClient(ctx: IRouterContext) {
        const clientDataRepo = (await dbConnect.connect()).getRepository(Client);

        const id = ctx.params.id;
        const { name, description, options } = ctx.request.body as { name: string; description: string; options?: Options };

        // Validation: Ensure description is provided
        if (!description || description.trim() === "") {
            ctx.status = 400;
            ctx.body = { message: "Description is required and cannot be empty" };
            return;
        }

        const client = await clientDataRepo.findOneOrFail({
            where: { id: +id }
        });

        const prod = new Product();
        prod.name = name;
        prod.description = description;  // Ensure valid description
        prod.client = client;
        prod.options = options;

        try {
            await this.productDataRepo.save(prod);
            ctx.status = 201;
            ctx.body = { message: "Product created successfully", product: prod };
        } catch (error) {
            ctx.status = 500;
            ctx.body = { message: "Error creating product", error};
        }
    }

    // Get All Products for a Client
    public async getProductForClient(ctx: IRouterContext) {
        const clientId = ctx.params.id;
        //console.log(clientId);
        try {
            const products = await this.productDataRepo.findOneOrFail({
                where: {
                    client: {
                        id: +clientId
                    }
                    },
                relations: { variant: true },  // Include variants if needed
            });
            //console.log(products);
            if (!products) {
                ctx.status = 404;
                ctx.body = { message: "Products not found." };
                return;
            }

            ctx.status = 200;
            ctx.body = products;
        } catch (error) {
            ctx.status = 500;
            ctx.body = { message: "Error fetching products", error };
        }
    }

    // Get Product by Id
    public async getProductById(ctx: IRouterContext) {
        const id = +ctx.params.id;

        try {
            const product = await this.productDataRepo.find({
                where: { id },
                relations: { variant: true },
            });

            if (!product) {
                ctx.status = 404;
                ctx.body = { message: "Product not found" };
                return;
            }

            ctx.status = 200;
            ctx.body = product;
        } catch (error) {
            ctx.status = 500;
            ctx.body = { message: "Error fetching product", error };
        }
    }

    // Update product by id
    public async updateProductById(ctx: IRouterContext) {
        const id = +ctx.params.id;
        const { name, description } = ctx.request.body as { name: string; description: string };

        // Validate that description is not empty
        if (!description || description.trim() === "") {
            ctx.status = 400;
            ctx.body = { message: "Description is required and cannot be empty" };
            return;
        }

        try {
            const product = await this.productDataRepo.findOneBy({ id });

            if (!product) {
                ctx.status = 404;
                ctx.body = { message: "Product not found" };
                return;
            }

            // Update fields
            product.name = name;
            product.description = description;

            await this.productDataRepo.save(product);

            ctx.status = 200;
            ctx.body = { message: "Product updated successfully", product };
        } catch (error) {
            ctx.status = 500;
            ctx.body = { message: "Error updating product", error};
        }
    }

    // Delete product by id
    public async deleteProductById(ctx: IRouterContext) {
        const id = +ctx.params.id;

        try {
            const result = await this.productDataRepo.delete(id);

            if (result.affected === 0) {
                ctx.status = 404;
                ctx.body = { message: "Product not found" };
                return;
            }

            ctx.status = 200;
            ctx.body = { message: "Product deleted successfully" };
        } catch (error) {
            ctx.status = 500;
            ctx.body = { message: "Error deleting product", error};
        }
    }
}
