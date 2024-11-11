import {Client} from "../entities/Client";
import {IRouterContext} from "koa-router";
import {Product} from "../entities/Product";
import {
    BAD_REQUEST_STATUS, NOT_FOUND_STATUS, OK_STATUS, VALID_ID
} from "../utils/StatusCode";
import {BaseController} from "./BaseController";
import {Repository} from "typeorm";

export class ProductController extends BaseController {
    protected productDataRepo: Repository<Product>;
    protected clientDataRepo: Repository<Client>;

    constructor(connection: any) {
        super();
        this.productDataRepo = connection.getRepository(Product);
        this.clientDataRepo = connection.getRepository(Client);
    }

    // Create Product for a Client
    public async createProductForClient(ctx: IRouterContext) {
        try {
            const id = Number(ctx.params.id);
            const {name, description} = ctx.request.body as {
                name: string;
                description: string;
            };

            if(!id){
                return this.badRequest(ctx, BAD_REQUEST_STATUS, VALID_ID );
            }

            if (!description || description.trim() === "") {
                return this.badRequest(ctx, BAD_REQUEST_STATUS, "Description must be provided.");
            }

            if (!name || name.trim() === "") {
                return this.badRequest(ctx, BAD_REQUEST_STATUS, "Name must be provided.");
            }

            const client = await this.clientDataRepo.findOne({
                where: {
                    id
                }
            });

            if(!client){
                return this.badRequest(ctx, NOT_FOUND_STATUS, "Cannot create product for the given client ID(Client does not exist).");
            }

            const prod = new Product();
            prod.name = name;
            prod.description = description;
            prod.client = client as Client;

            await this.productDataRepo.save(prod);
            return this.okStatus(ctx, OK_STATUS, "Product Created Successfully.");

        } catch (error) {
            this.badRequest(ctx, ctx.status, "Client Not Found.");
        }
    }

    // Get All Products for a Client
    public async getProductForClient(ctx: IRouterContext) {
        try {

            const id = Number(ctx.params.id);

            if(!id){
                return this.badRequest(ctx, BAD_REQUEST_STATUS, VALID_ID );
            }

            const client = await this.clientDataRepo.findOne({
                where: {
                    id: id
                }
            });

            const products = await this.productDataRepo.findOne({
                where: {
                    client: {
                        id: id
                    }
                }
            });

            return this.okStatus(ctx, OK_STATUS, products);
        } catch (error) {
            return this.badRequest(ctx, ctx.status, error);
        }
    }

    // Get Product by Id
    async getProductById(ctx: IRouterContext) {
        try {

            const id = Number(ctx.params.id);

            if(!id){
                return this.badRequest(ctx, BAD_REQUEST_STATUS, VALID_ID );
            }

            const product = await this.productDataRepo.findOne({
                where: {id: id}
            });

            if (!product) {
                return this.badRequest(ctx, NOT_FOUND_STATUS, "Product not found.");
            }

            return this.okStatus(ctx, OK_STATUS, product);
        } catch (error) {
            return this.badRequest(ctx, ctx.status, error);
        }
    }

    // Update product by id
    public async updateProductById(ctx: IRouterContext) {
        try {

            const id = Number(ctx.params.id);

            if(!id){
                return this.badRequest(ctx, BAD_REQUEST_STATUS, VALID_ID );
            }

            const {name, description} = ctx.request.body as { name: string; description: string };

            const product = await this.productDataRepo.findOneBy({id});

            if (!product) {
                return this.badRequest(ctx, NOT_FOUND_STATUS, "Product Not Found.")
            }

            product.name = name;
            product.description = description;

            await this.productDataRepo.save(product);

            return this.okStatus(ctx, OK_STATUS, "Product Updated Successfully.");

        } catch (error) {
            return this.badRequest(ctx, ctx.status, error);
        }
    }

    // Delete product by id
    public async deleteProductById(ctx: IRouterContext) {
        try {

            const id = Number(ctx.params.id);

            if(!id){
                return this.badRequest(ctx, BAD_REQUEST_STATUS, VALID_ID );
            }

            const result = await this.productDataRepo.delete(id);

            if (result.affected === 0) {
                return this.badRequest(ctx, NOT_FOUND_STATUS, "Product Not Found");
            }

            return this.okStatus(ctx, OK_STATUS, "Product Deleted Successfully.");
        } catch (error) {
            return this.badRequest(ctx, ctx.status, error);
        }
    }
}
