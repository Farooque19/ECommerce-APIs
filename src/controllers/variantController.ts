import { Variant } from "../entities/Variant"
import { DBConnection } from "../db/dbConnection";
import { IRouterContext } from "koa-router";
import { Product } from "../entities/Product";
import { Options, PriceMapping } from "../config/type";


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
        console.log(productId);
        const { priceMapping } = ctx.request.body as { priceMapping: PriceMapping };
        console.log(priceMapping);

        const product = await productDataRepo.findOneOrFail({
            where: {
                id: +productId
            }
        });
        console.log(product);
        if (!product) {
            ctx.status = 404;
            ctx.body = "Product not found.";
            return;
        }

        const { options } = product;
        console.log(options);
        if (!options || !options.color || !options.size) {
            ctx.status = 400;
            ctx.body = "Product does not have options (e.g., color or size) to create variants.";
            return;
        }

        const variants = generateVariants(options, priceMapping, product);
        console.log(variants);
        const result = await this.variantDataRepo.save(variants);
        console.log(result);
        ctx.status = 200;
        ctx.body = "Variants created successfully.";
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
            ctx.status = 404;
            ctx.body = "Not Found";
            return;
        }
        ctx.body = variant;
        ctx.status = 200;
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
            ctx.status = 404;
            ctx.body = "Not Found";
            return;
        }
        ctx.body = variant;
        ctx.status = 200;
    }


    //Update Variant by id
    public async updateVariantById(ctx: IRouterContext) {
        const id = +ctx.params.id;
        const {name, price, inventory} = ctx.request.body as { name: string; price: number; inventory: number; };
        await this.variantDataRepo.update(id, {
            name: name,
            price: price,
            inventory: inventory
        });
        ctx.status = 200;
        ctx.body = "Variant record updated.";
    }


    //Delete Variant by id
    public async deleteVariantById(ctx: IRouterContext){
        const id = ctx.params.id;
        const result = await this.variantDataRepo.delete(id);
        if(result.affected === 0){
            ctx.status = 404;
            ctx.body = "Variant not found.";
            return;
        }
        ctx.status = 200;
        ctx.body = "Variant record deleted.";
    }

}