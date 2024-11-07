import {Variant} from "../entities/Variant"
import {IRouterContext} from "koa-router";
import {Product} from "../entities/Product";
import {Options, PriceMapping} from "../config/Type";
import {BaseController} from "./BaseController";
import {
    BAD_REQUEST_MESSAGE,
    BAD_REQUEST_STATUS, CREATED_STATUS, CREATED_STATUS_MESSAGE,
    NOT_FOUND_MESSAGE, NOT_FOUND_STATUS, OK_STATUS, OK_STATUS_MESSAGE
} from "../utils/StatusCode";
import {Repository} from "typeorm";

function generateVariants(options: Options, priceMapping: PriceMapping, product: Product): Variant[] {
    const variants: Variant[] = [];

    // Loop through each key in options to create variant combinations
    const colors = options.color || [];
    const sizes = options.size || [];

    for (let color of colors) {
        for (let size of sizes) {
            const variantName = `${color} / ${size}`; // e.g., "Red / S"
            const variantPrice = priceMapping[variantName] || 0; // Get price from mapping or default to 0
            const variant = new Variant(); // Create new Variant instance
            variant.name = variantName;
            variant.price = variantPrice;
            variant.product = product; // Link the variant to the product
            variants.push(variant); // Add the variant to the array
        }
    }

    return variants;
}


export class VariantController extends BaseController {
    protected variantDataRepo: Repository<Variant>;
    protected productDataRepo: Repository<Product>;

    constructor(connection: any) {
        super();
        this.variantDataRepo = connection.getRepository(Variant);
        this.productDataRepo = connection.getRepository(Product);
    }

    //Create Variant for a Product
    public async createVariantForProduct(ctx: IRouterContext) {
        const productId = ctx.params.productId;
        const {priceMapping} = ctx.request.body as { priceMapping: PriceMapping };

        if (isNaN(+productId) || +productId <= 0) {
            return this.badRequest(ctx, BAD_REQUEST_STATUS, BAD_REQUEST_MESSAGE);
        }

        if (!priceMapping) {
            return this.badRequest(ctx, BAD_REQUEST_STATUS, BAD_REQUEST_MESSAGE);
        }

        const product = await this.productDataRepo.findOneOrFail({
            where: {
                id: +productId
            }
        });

        if (!product) {
            this.badRequest(ctx, BAD_REQUEST_STATUS, BAD_REQUEST_MESSAGE);
            return;
        }

        const {options} = product;

        if (!options || !options.color || !options.size) {
            this.badRequest(ctx, BAD_REQUEST_STATUS, BAD_REQUEST_MESSAGE);
            return;
        }

        const variants = generateVariants(options, priceMapping, product);
        await this.variantDataRepo.save(variants);
        this.okStatus(ctx, CREATED_STATUS, CREATED_STATUS_MESSAGE);
    }

    //Get all Variants for a product
    public async getVariantsForProduct(ctx: IRouterContext) {
        const id = ctx.params.productId;
        if (isNaN(+id) || +id <= 0) {
            return this.badRequest(ctx, BAD_REQUEST_STATUS, BAD_REQUEST_MESSAGE);
        }
        const variant = await this.variantDataRepo.find({
            where: {
                product: {
                    id: +id
                }
            }
        });

        if (!variant || variant.length === 0) {
            return this.badRequest(ctx, NOT_FOUND_STATUS, NOT_FOUND_MESSAGE)
        }

        ctx.body = variant;
        this.okStatus(ctx, OK_STATUS, OK_STATUS_MESSAGE);
    }

    //Get Variant by id
    public async getVariantById(ctx: IRouterContext) {
        const id = +ctx.params.id;

        if (isNaN(+id) || +id <= 0) {
            return this.badRequest(ctx, BAD_REQUEST_STATUS, BAD_REQUEST_MESSAGE);
        }

        const variant = await this.variantDataRepo.findOneOrFail({
            where: {
                id: +id
            }
        });

        if (!variant) {
            this.badRequest(ctx, BAD_REQUEST_STATUS, BAD_REQUEST_MESSAGE)
            return;
        }

        ctx.body = variant;
        this.okStatus(ctx, OK_STATUS, OK_STATUS_MESSAGE)
    }


    //Update Variant by id
    public async updateVariantById(ctx: IRouterContext) {
        const id = +ctx.params.id;

        if (isNaN(+id) || +id <= 0) {
            return this.badRequest(ctx, BAD_REQUEST_STATUS, BAD_REQUEST_MESSAGE);
        }

        const {name, price, inventory} = ctx.request.body as { name: string; price: number; inventory: number; };
        const variant = await this.variantDataRepo.findOne({
            where: {
                id: id
            }
        });

        if (!variant) {
            return this.badRequest(ctx, NOT_FOUND_STATUS, NOT_FOUND_MESSAGE)
        }

        await this.variantDataRepo.update(id, {
            name: name,
            price: price,
            inventory: inventory
        });

        this.okStatus(ctx, OK_STATUS, OK_STATUS_MESSAGE)
    }


    //Delete Variant by id
    public async deleteVariantById(ctx: IRouterContext) {
        const id = ctx.params.id;

        if (isNaN(+id) || +id <= 0) {
            return this.badRequest(ctx, BAD_REQUEST_STATUS, BAD_REQUEST_MESSAGE);
        }

        const result = await this.variantDataRepo.delete(id);

        if (result.affected === 0) {
            return this.badRequest(ctx, NOT_FOUND_STATUS, NOT_FOUND_MESSAGE)
        }

        this.okStatus(ctx, OK_STATUS, OK_STATUS_MESSAGE);
    }

}