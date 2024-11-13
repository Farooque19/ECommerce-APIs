import {Client} from "../entities/Client";
import {IRouterContext} from "koa-router";
import {Product} from "../entities/Product";
import {
    BAD_REQUEST_STATUS,
    NOT_FOUND_STATUS,
    OK_STATUS,
    INTERNAL_SERVER_ERROR_MESSAGE,
    INTERNAL_SERVER_ERROR_CODE
} from "../utils/StatusCode";
import {BaseController} from "./BaseController";
import {DataSource, Repository} from "typeorm";

export class ProductController extends BaseController {
    protected productDataRepo: Repository<Product>;
    protected clientDataRepo: Repository<Client>;

    constructor(connection: DataSource) {
        super();
        this.productDataRepo = connection.getRepository(Product);
        this.clientDataRepo = connection.getRepository(Client);
    }

    // Create Product for a Client
    public async createProductForClient(ctx: IRouterContext): Promise<void> {
        try {
            const id: number = Number(ctx.params.id);
            const {name, description} = ctx.request.body as {
                name: string;
                description: string;
            };

            if (!description || !name)
                return this.badRequest(ctx, BAD_REQUEST_STATUS, "Name and Description must be provided.");

            const client = await this.clientDataRepo.findOne({
                select: {id: true},
                where: {
                    id: id
                }
            });

            if (!client) {
                return this.badRequest(ctx, NOT_FOUND_STATUS, "Cannot create product for the given client ID(Client does not exist).");
            }

            const prod = new Product();
            prod.name = name;
            prod.description = description;
            prod.client = client;
            await this.productDataRepo.save(prod);
            return this.okStatus(ctx, OK_STATUS, "Product Created Successfully.");
        } catch (error) {
            this.badRequest(ctx, INTERNAL_SERVER_ERROR_CODE, INTERNAL_SERVER_ERROR_MESSAGE);
        }
    }

    // Get All Products for a Client
    public async getProductForClient(ctx: IRouterContext): Promise<void> {
        try {
            const id: number = Number(ctx.params.id);

            const products = await this.productDataRepo.find({
                where: {
                    client: {
                        id: id
                    }
                }
            });
            return this.okStatus(ctx, OK_STATUS, undefined, products);
        } catch (error) {
            return this.badRequest(ctx, INTERNAL_SERVER_ERROR_CODE, INTERNAL_SERVER_ERROR_MESSAGE);
        }
    }

    // Get Product by Id
    async getProductById(ctx: IRouterContext): Promise<void> {
        try {
            const id: number = Number(ctx.params.id);
            const product = await this.productDataRepo.findOne({
                where: {id: id}
            });

            if (!product) {
                return this.badRequest(ctx, NOT_FOUND_STATUS, "Product not found.");
            }

            return this.okStatus(ctx, OK_STATUS, undefined, product);
        } catch (error) {
            return this.badRequest(ctx, INTERNAL_SERVER_ERROR_CODE, INTERNAL_SERVER_ERROR_MESSAGE);
        }
    }

    // Update product by id
    public async updateProductById(ctx: IRouterContext): Promise<void> {
        try {
            const id: number = Number(ctx.params.id);
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
    public async deleteProductById(ctx: IRouterContext): Promise<void> {
        try {
            const id: number = Number(ctx.params.id);

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
