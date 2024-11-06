import { Variant } from "../entities/Variant"
import { DBConnection } from "../db/dbConnection";
import { IRouterContext } from "koa-router";
import { Product } from "../entities/Product";
import { Options, PriceMapping } from "../config/type";
import * as statusCodes from "../utils/statusCode"


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

const dbConnect = new DBConnection();


export class VariantController {
    protected variantDataRepo : any;

    constructor(connection: any) {
        this.variantDataRepo = connection.getRepository(Variant);
    }


    //Create Variant for a Product
    public async createVariantForProduct(ctx: IRouterContext) {
        const productDataRepo = (await dbConnect.connect()).getRepository(Product);
        const productId = ctx.params.productId;
        const { priceMapping } = ctx.request.body as { priceMapping: PriceMapping };

        const product = await productDataRepo.findOneOrFail({
            where: {
                id: +productId
            }
        });

        if (!product) {
            ctx.status = statusCodes.NOT_FOUND_STATUS;
            ctx.body = statusCodes.NOT_FOUND_MESSAGE;
            return;
        }

        const { options } = product;

        if (!options || !options.color || !options.size) {
            ctx.status = statusCodes.BAD_REQUEST_STATUS;
            ctx.body = statusCodes.BAD_REQUEST_MESSAGE;
            return;
        }

        const variants = generateVariants(options, priceMapping, product);
        console.log(variants);
        await this.variantDataRepo.save(variants);
        ctx.status = statusCodes.OK_STATUS;
        ctx.body = statusCodes.OK_STATUS_MESSAGE;
    }


    //Get all Variants for a product
    public async getVariantsForProduct(ctx: IRouterContext) {
        const id = ctx.params.productId;
        const variant = await this.variantDataRepo.find({
            where: {
                product: {
                    id: +id
                }
            }
        });
        if (!variant) {
            ctx.status = statusCodes.NOT_FOUND_STATUS;
            ctx.body = statusCodes.NOT_FOUND_MESSAGE;
            return;
        }
        ctx.body = variant;
        ctx.status = statusCodes.OK_STATUS;
    }


    //Get Variant by id
    public async getVariantById(ctx: IRouterContext) {
        const id = +ctx.params.id;
        const variant = await this.variantDataRepo.findOne({
            where: {
                id: +id
            }
        });
        if (!variant) {
            ctx.status = statusCodes.NOT_FOUND_STATUS;
            ctx.body = statusCodes.NOT_FOUND_MESSAGE;
            return;
        }
        ctx.body = variant;
        ctx.status = statusCodes.OK_STATUS;
    }


    //Update Variant by id
    public async updateVariantById(ctx: IRouterContext) {
        const id = +ctx.params.id;
        const {name, price, inventory} = ctx.request.body as { name: string; price: number; inventory: number; };
        const variant = await this.variantDataRepo.findOne({
            where: {
                id: id
            }
        });
        if(!variant){
            ctx.status = statusCodes.NOT_FOUND_STATUS;
            ctx.body = statusCodes.NOT_FOUND_MESSAGE
            return
        }
        await this.variantDataRepo.update(id, {
            name: name,
            price: price,
            inventory: inventory
        });
        ctx.status = statusCodes.OK_STATUS;
        ctx.body = statusCodes.OK_STATUS_MESSAGE;
    }


    //Delete Variant by id
    public async deleteVariantById(ctx: IRouterContext){
        const id = ctx.params.id;
        const result = await this.variantDataRepo.delete(id);
        if(result.affected === 0){
            ctx.status = statusCodes.NOT_FOUND_STATUS;
            ctx.body = statusCodes.NOT_FOUND_MESSAGE;
            return;
        }
        ctx.status = statusCodes.OK_STATUS;
        ctx.body = statusCodes.OK_STATUS_MESSAGE;
    }

}