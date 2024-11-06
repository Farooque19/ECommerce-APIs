import { Client } from "../entities/Client";
import { DBConnection } from "../db/dbConnection";
import { IRouterContext } from "koa-router";
import { Product } from "../entities/Product";
import { Options } from "../config/type";
import * as statusCodes from "../utils/statusCode"

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
            ctx.status = statusCodes.BAD_REQUEST_STATUS
            ctx.body = { message: statusCodes.BAD_REQUEST_MESSAGE };
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
            ctx.status = statusCodes.OK_STATUS;
            ctx.body = { message: statusCodes.OK_STATUS_MESSAGE, product: prod };
        } catch (error) {
            ctx.status = statusCodes.INTERNAL_SERVER_ERROR_STATUS
            ctx.body = { message: statusCodes.INTERNAL_SERVER_ERROR_MESSAGE, error};
        }
    }

    // Get All Products for a Client
    public async getProductForClient(ctx: IRouterContext) {
        const clientId = ctx.params.id;
        try {
            const products = await this.productDataRepo.findOneOrFail({
                where: {
                    client: {
                        id: +clientId
                    }
                    },
                relations: { variant: true },  // Include variants if needed
            });
            if (!products) {
                ctx.status = statusCodes.NOT_FOUND_STATUS;
                ctx.body = { message: statusCodes.NOT_FOUND_MESSAGE };
                return;
            }

            ctx.status = statusCodes.OK_STATUS;
            ctx.body = products;
        } catch (error) {
            ctx.status = statusCodes.INTERNAL_SERVER_ERROR_STATUS;
            ctx.body = { message: statusCodes.INTERNAL_SERVER_ERROR_MESSAGE, error };
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
                ctx.status = statusCodes.NOT_FOUND_STATUS;
                ctx.body = { message: statusCodes.NOT_FOUND_MESSAGE };
                return;
            }

            ctx.status = statusCodes.OK_STATUS;
            ctx.body = product;
        } catch (error) {
            ctx.status = statusCodes.INTERNAL_SERVER_ERROR_STATUS;
            ctx.body = { message: statusCodes.INTERNAL_SERVER_ERROR_MESSAGE, error };
        }
    }

    // Update product by id
    public async updateProductById(ctx: IRouterContext) {
        const id = +ctx.params.id;
        const { name, description } = ctx.request.body as { name: string; description: string };

        // Validate that description is not empty
        if (!description || description.trim() === "") {
            ctx.status = statusCodes.BAD_REQUEST_STATUS;
            ctx.body = { message: statusCodes.BAD_REQUEST_MESSAGE };
            return;
        }

        try {
            const product = await this.productDataRepo.findOneBy({ id });

            if (!product) {
                ctx.status = statusCodes.NOT_FOUND_STATUS;
                ctx.body = { message: statusCodes.NOT_FOUND_MESSAGE };
                return;
            }

            // Update fields
            product.name = name;
            product.description = description;

            await this.productDataRepo.save(product);

            ctx.status = statusCodes.OK_STATUS;
            ctx.body = { message: statusCodes.OK_STATUS_MESSAGE, product };
        } catch (error) {
            ctx.status = statusCodes.INTERNAL_SERVER_ERROR_STATUS;
            ctx.body = { message: statusCodes.INTERNAL_SERVER_ERROR_MESSAGE, error};
        }
    }

    // Delete product by id
    public async deleteProductById(ctx: IRouterContext) {
        const id = +ctx.params.id;

        try {
            const result = await this.productDataRepo.delete(id);

            if (result.affected === 0) {
                ctx.status = statusCodes.NOT_FOUND_STATUS;
                ctx.body = { message: statusCodes.NOT_FOUND_MESSAGE };
                return;
            }

            ctx.status = statusCodes.OK_STATUS;
            ctx.body = { message: statusCodes.OK_STATUS_MESSAGE };
        } catch (error) {
            ctx.status = statusCodes.INTERNAL_SERVER_ERROR_STATUS;
            ctx.body = { message: statusCodes.INTERNAL_SERVER_ERROR_MESSAGE, error};
        }
    }
}
