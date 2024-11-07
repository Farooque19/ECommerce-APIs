import { Client } from "../entities/Client";
import { IRouterContext } from "koa-router";
import { Product } from "../entities/Product";
import { Options } from "../config/Type";
import {
    BAD_REQUEST_MESSAGE,
    BAD_REQUEST_STATUS,
    INTERNAL_SERVER_ERROR_MESSAGE,
    INTERNAL_SERVER_ERROR_STATUS, NOT_FOUND_MESSAGE, NOT_FOUND_STATUS, OK_STATUS, OK_STATUS_MESSAGE
} from "../utils/StatusCode";
import {BaseController} from "./BaseController";
import {getClientRepository, getProductRepository} from "../Repository/Repository";
import {Repository} from "typeorm";

export class ProductController extends BaseController{
    protected productDataRepo : Repository<Product>;
    protected clientDataRepo : Repository<Client>;
    constructor() {
        super();
        (async () => {
            this.productDataRepo = await getProductRepository();
            this.clientDataRepo = await getClientRepository()
        })();
    }

    // Create Product for a Client
    public async createProductForClient(ctx: IRouterContext) {
        const id = ctx.params.id;
        const { name, description, options } = ctx.request.body as { name: string; description: string; options?: Options };

        if (isNaN(+id) || +id <= 0) {
            return this.badRequest(ctx, BAD_REQUEST_STATUS, BAD_REQUEST_MESSAGE);
        }

        if (!description || description.trim() === "") {
            return this.badRequest(ctx, BAD_REQUEST_STATUS, BAD_REQUEST_MESSAGE);
        }

        if(!name || name.trim() === "") {
            return this.badRequest(ctx, BAD_REQUEST_STATUS, BAD_REQUEST_MESSAGE);
        }

        if(!options){
            return this.badRequest(ctx, BAD_REQUEST_STATUS, BAD_REQUEST_MESSAGE);
        }

        const client = await this.clientDataRepo.findOneOrFail({
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

        if(!clientId){
            return this.badRequest(ctx, BAD_REQUEST_STATUS, BAD_REQUEST_MESSAGE)
        }

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
                return this.badRequest(ctx, NOT_FOUND_STATUS, NOT_FOUND_MESSAGE);
            }

            this.okStatus(ctx, OK_STATUS, OK_STATUS_MESSAGE);
            ctx.body = products;
        } catch (error) {
            this.badRequest(ctx, INTERNAL_SERVER_ERROR_STATUS, INTERNAL_SERVER_ERROR_MESSAGE);
        }
    }

    // Get Product by Id
     async getProductById(ctx: IRouterContext) {
        const id = +ctx.params.id;

         if(!id){
             return this.badRequest(ctx, BAD_REQUEST_STATUS, BAD_REQUEST_MESSAGE)
         }

        try {
            const product = await this.productDataRepo.find({
                where: { id },
                relations: { variant: true },
            });

            if (!product || product.length === 0) {
                return this.badRequest(ctx, NOT_FOUND_STATUS, NOT_FOUND_MESSAGE);
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

        if(isNaN(id) || id <= 0){
            return this.badRequest(ctx, BAD_REQUEST_STATUS, BAD_REQUEST_MESSAGE)
        }

        const { name, description } = ctx.request.body as { name: string; description: string };

        try {
            const product = await this.productDataRepo.findOneBy({ id });

            if (!product) {
                return this.badRequest(ctx, NOT_FOUND_STATUS, NOT_FOUND_MESSAGE)
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

        if(isNaN(id) || id <= 0){
            return this.badRequest(ctx, BAD_REQUEST_STATUS, BAD_REQUEST_MESSAGE)
        }

        try {
            const result = await this.productDataRepo.delete(id);

            if (result.affected === 0) {
                return this.badRequest(ctx, NOT_FOUND_STATUS, NOT_FOUND_MESSAGE);
            }

            this.okStatus(ctx, OK_STATUS, OK_STATUS_MESSAGE)
        } catch (error) {
            this.badRequest(ctx, INTERNAL_SERVER_ERROR_STATUS, INTERNAL_SERVER_ERROR_MESSAGE);
        }
    }
}
