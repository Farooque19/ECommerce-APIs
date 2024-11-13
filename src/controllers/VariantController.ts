import {Variant} from "../entities/Variant"
import {IRouterContext} from "koa-router";
import {Product} from "../entities/Product";
import {BaseController} from "./BaseController";
import {
    BAD_REQUEST_STATUS,
    CREATED_STATUS,
    NOT_FOUND_STATUS,
    OK_STATUS,
    INTERNAL_SERVER_ERROR_MESSAGE,
    INTERNAL_SERVER_ERROR_CODE
} from "../utils/StatusCode";
import {DataSource, Repository} from "typeorm";
import {Options} from "../config/Type";

function generateVariants(options: Options, product: Product): Variant[] {
    let variants: Variant[] = [];
    const option1 = options.option1?.value || [];
    const option2 = options.option2?.value || [];
    const option3 = options.option3?.value || [];
    let optionsNames: string[] = [];
    let optionsName: string = "";

    for (let value1 of option1) {
        optionsName = `${value1}`;

        for (let value2 of option2) {
            optionsName = `${value1} / ${value2}`;

            for (let value3 of option3) {
                optionsName = `${value1} / ${value2} / ${value3}`;
                optionsNames.push(optionsName);
            }

            if (!optionsNames.includes(optionsName)) {
                optionsNames.push(optionsName);
            }
        }
        if (!optionsNames.includes(optionsName)) {
            optionsNames.push(optionsName);
        }

    }
    variants = eachVariant(optionsNames, product)
    return variants;
}

function eachVariant(variantName: string[], product: Product) {
    let variants: Variant[] = [];

    for (let variant of variantName) {
        const variantInstance = new Variant();
        variantInstance.name = variant;
        variantInstance.price = Math.floor(Math.random() * 1000) + 1;
        variantInstance.product = product;
        variants.push(variantInstance);
    }
    return variants
}

export class VariantController extends BaseController {
    protected variantDataRepo: Repository<Variant>;
    protected productDataRepo: Repository<Product>;

    constructor(connection: DataSource) {
        super();
        this.variantDataRepo = connection.getRepository(Variant);
        this.productDataRepo = connection.getRepository(Product);
    }

    //Create Variant for a Product
    public async createVariantForProduct(ctx: IRouterContext): Promise<void> {
        try {
            const productId: number = Number(ctx.params.productId);
            const options = ctx.request.body as Options;

            if (!options)
                return this.badRequest(ctx, NOT_FOUND_STATUS, "Options not provided correctly.");

            if (Object.keys(options).length === 0)
                return this.badRequest(ctx, BAD_REQUEST_STATUS, "Must contain at least one option.");

            if (Object.keys(options).length > 3)
                return this.badRequest(ctx, BAD_REQUEST_STATUS, "Maximum allowed options are 3.");

            for (let key of Object.keys(options)) {
                const option = options[key];

                if (!option.name || !option.value || option.value.length === 0)
                    return this.badRequest(ctx, BAD_REQUEST_STATUS, "Name and Value both should be provided.");

                for (let optionVal of option.value) {
                    if (!optionVal.trim())
                        return this.badRequest(ctx, BAD_REQUEST_STATUS, "Value cannot be empty or undefined.");
                }
            }

            const product = await this.productDataRepo.findOne({
                select: {id: true},
                where: {
                    id: productId
                }
            });

            if (!product)
                return this.badRequest(ctx, BAD_REQUEST_STATUS, "Cannot create variant as product does not exists.");

            const variant: Variant[] = generateVariants(options, product);
            await this.variantDataRepo.save(variant);
            return this.okStatus(ctx, CREATED_STATUS, "Variant Created");
        } catch (error) {
            return this.badRequest(ctx, INTERNAL_SERVER_ERROR_CODE, INTERNAL_SERVER_ERROR_MESSAGE);
        }
    }

    //Get all Variants for a product
    public async getVariantsForProduct(ctx: IRouterContext): Promise<void> {
        try {
            const id: number = Number(ctx.params.productId);

            const variant = await this.variantDataRepo.find({
                where: {
                    product: {
                        id: id
                    }
                }
            });

            return this.okStatus(ctx, OK_STATUS, undefined, variant);
        } catch (error) {
            return this.badRequest(ctx, INTERNAL_SERVER_ERROR_CODE, INTERNAL_SERVER_ERROR_MESSAGE);
        }
    }

    //Get Variant by id
    public async getVariantById(ctx: IRouterContext): Promise<void> {
        try {
            const id: number = Number(ctx.params.id);

            const variant = await this.variantDataRepo.findOne({
                where: {
                    id: id
                }
            });

            if (!variant)
                return this.badRequest(ctx, NOT_FOUND_STATUS, "Variant Not Found.");

            return this.okStatus(ctx, OK_STATUS, undefined, variant);
        } catch (error) {
            return this.badRequest(ctx, INTERNAL_SERVER_ERROR_CODE, INTERNAL_SERVER_ERROR_MESSAGE);
        }
    }


    //Update Variant by id
    public async updateVariantById(ctx: IRouterContext): Promise<void> {
        try {
            const id: number = Number(ctx.params.id);
            const {name, price, inventory} = ctx.request.body as { name: string; price: number; inventory: number; };

            const variant = await this.variantDataRepo.findOne({
                where: {
                    id: id
                }
            });

            if (!variant)
                return this.badRequest(ctx, NOT_FOUND_STATUS, "Variant Not Found.");

            await this.variantDataRepo.update(id, {
                name: name,
                price: price,
                inventory: inventory
            });
            return this.okStatus(ctx, OK_STATUS, "Variant Updated Successfully.");
        } catch (error) {
            return this.badRequest(ctx, INTERNAL_SERVER_ERROR_CODE, INTERNAL_SERVER_ERROR_MESSAGE);
        }
    }


    //Delete Variant by id
    public async deleteVariantById(ctx: IRouterContext): Promise<void> {
        try {
            const id: number = Number(ctx.params.id);
            const result = await this.variantDataRepo.delete(id);

            if (result.affected === 0)
                return this.badRequest(ctx, NOT_FOUND_STATUS, "Variant Not Found.");

            return this.okStatus(ctx, OK_STATUS, "Variant Deleted Successfully.");
        } catch (error) {
            return this.badRequest(ctx, INTERNAL_SERVER_ERROR_CODE, INTERNAL_SERVER_ERROR_MESSAGE);
        }
    }
}