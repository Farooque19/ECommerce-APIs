import { Client } from "../entities/Client";
import { DBConnection } from "../db/dbConnection";
import { IRouterContext } from "koa-router";
import { Product } from "../entities/Product";
import { Options } from "../config/type";
import {
    BAD_REQUEST_MESSAGE,
    BAD_REQUEST_STATUS,
    INTERNAL_SERVER_ERROR_MESSAGE,
    INTERNAL_SERVER_ERROR_STATUS, NOT_FOUND_MESSAGE, NOT_FOUND_STATUS, OK_STATUS, OK_STATUS_MESSAGE
} from "../utils/statusCode";
import {BaseController} from "./baseController";

const dbConnect = new DBConnection();

export class ProductController extends BaseController{
    protected productDataRepo : any;
    constructor(connection: any) {
        super();
        this.productDataRepo = connection.getRepository(Product);
    }

    // Create Product for a Client
    public async createProductForClient(ctx: IRouterContext) {
        const clientDataRepo = (await dbConnect.connect()).getRepository(Client);

        const id = ctx.params.id;
        const { name, description, options } = ctx.request.body as { name: string; description: string; options?: Options };

        // Validation: Ensure description is provided
        if (!description || description.trim() === "") {
            this.badRequest(ctx, BAD_REQUEST_STATUS, BAD_REQUEST_MESSAGE);
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
            this.okStatus(ctx, OK_STATUS, OK_STATUS_MESSAGE);
        } catch (error) {
            this.badRequest(ctx, INTERNAL_SERVER_ERROR_STATUS, INTERNAL_SERVER_ERROR_MESSAGE)
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
                this.badRequest(ctx, NOT_FOUND_STATUS, NOT_FOUND_MESSAGE);
                return;
            }

            this.okStatus(ctx, OK_STATUS, OK_STATUS_MESSAGE);
            ctx.body = products;
        } catch (error) {
            this.badRequest(ctx, INTERNAL_SERVER_ERROR_STATUS, INTERNAL_SERVER_ERROR_MESSAGE);
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

            if (!product || product.length === 0) {
                this.badRequest(ctx, NOT_FOUND_STATUS, NOT_FOUND_MESSAGE);
                return;
            }

            this.okStatus(ctx, OK_STATUS, OK_STATUS_MESSAGE);
            ctx.body = product;
        } catch (error) {
            this.badRequest(ctx, INTERNAL_SERVER_ERROR_STATUS, INTERNAL_SERVER_ERROR_MESSAGE);
        }
    }

    // Update product by id
    public async updateProductById(ctx: IRouterContext) {
        const id = +ctx.params.id;
        const { name, description } = ctx.request.body as { name: string; description: string };

        try {
            const product = await this.productDataRepo.findOneBy({ id });

            if (!product) {
                this.badRequest(ctx, NOT_FOUND_STATUS, NOT_FOUND_MESSAGE)
                return;
            }

            // Update fields
            product.name = name;
            product.description = description;

            await this.productDataRepo.save(product);

            this.okStatus(ctx, OK_STATUS, OK_STATUS_MESSAGE);

        } catch (error) {
            this.badRequest(ctx, INTERNAL_SERVER_ERROR_STATUS, INTERNAL_SERVER_ERROR_MESSAGE);
        }
    }

    // Delete product by id
    public async deleteProductById(ctx: IRouterContext) {
        const id = +ctx.params.id;

        try {
            const result = await this.productDataRepo.delete(id);

            if (result.affected === 0) {
                this.badRequest(ctx, NOT_FOUND_STATUS, NOT_FOUND_MESSAGE);
                return;
            }

            this.okStatus(ctx, OK_STATUS, OK_STATUS_MESSAGE)
        } catch (error) {
            this.badRequest(ctx, INTERNAL_SERVER_ERROR_STATUS, INTERNAL_SERVER_ERROR_MESSAGE);
        }
    }
}
