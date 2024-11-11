import {Variant} from "../entities/Variant"
import {IRouterContext} from "koa-router";
import {Product} from "../entities/Product";
import {BaseController} from "./BaseController";
import {
    BAD_REQUEST_STATUS, CREATED_STATUS,
    NOT_FOUND_STATUS, OK_STATUS, VALID_ID
} from "../utils/StatusCode";
import {Repository} from "typeorm";
import {Options} from "../config/Type";

function generateVariants(options: Options, product: Product): Variant[] {
    const variants: Variant[] = [];
    const values: any[] = [];
    const keys: string[] = Object.keys(options);

    for (let i: number = 0; i < keys.length; i++) {
        values[i] = Object.values(options)[i].value;
    }

    let variantName: string[] = [];

    if (values.length === 1) {
        let count : number = 0;
        let val1: any[] = values[0];
        for (let value1 of val1) {
            variantName.push(value1);
            eachVariant(variantName, product, variants);
            count++;
        }

    } else if (values.length === 2) {
        let count : number = 0;
        const val1: any[] = values[0];
        const val2: any[] = values[1];
        for (let value1 of val1) {
            for (let value2 of val2) {
                variantName.push(`${value1} / ${value2}`)
                eachVariant(variantName, product, variants);
                count++;
            }
        }
        console.log(count);
    } else {
        const val1: any[] = values[0];
        const val2: any[] = values[1];
        const val3: any[] = values[2];

        let count : number = 0;
        for (let value1 of val1) {
            for (let value2 of val2) {
                for (let value3 of val3) {
                    variantName.push(`${value1} / ${value2} / ${value3}`);
                    eachVariant(variantName, product, variants);
                    count++;
                }
            }
        }
    }
    return variants;
}

function eachVariant(variantName : string[], product: Product, variants: Variant[]) : void{
    const variant = new Variant();
    variant.name = variantName[0];

    while(variantName.length > 0) {
        variantName.pop();
    }

    variant.price = Math.floor(Math.random() * 1000) + 1;
    variant.product = product;
    variants.push(variant);
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
        try {

            const productId = Number(ctx.params.productId);

            if(!productId) {
                return this.badRequest(ctx, BAD_REQUEST_STATUS, VALID_ID);
            }

            const product = await this.productDataRepo.findOne({
                where: {
                    id: productId
                }
            });

            const options = ctx.request.body as Options;

            if(!options){
                return this.badRequest(ctx, NOT_FOUND_STATUS, "Options not provided correctly.");
            }

            if(Object.keys(options).length === 0) {
                return this.badRequest(ctx, BAD_REQUEST_STATUS, "Must contain at least one option.");
            }

            if(Object.keys(options).length > 3) {
                return this.badRequest(ctx, BAD_REQUEST_STATUS, "Maximum allowed options are 3.");
            }

            for(let key of Object.keys(options)) {
                const option = options[key];

                if(!option.name || !option.value){
                    return this.badRequest(ctx, BAD_REQUEST_STATUS, "Name and Value both should be provided.");
                }

                if(option.value.length === 0){
                    return this.badRequest(ctx, BAD_REQUEST_STATUS, "Value should be provided.");
                }

                console.log(option.value.length);

                for(let optionVal of option.value){
                    if(optionVal.trim() === ""){
                        return this.badRequest(ctx, BAD_REQUEST_STATUS, "Value cannot be empty or undefined.");
                    }
                }

            }

            if (!product) {
                return this.badRequest(ctx, BAD_REQUEST_STATUS, "Cannot create variant as product does not exists.");
            }

            const variant: Variant[] = generateVariants(options, product);

            await this.variantDataRepo.save(variant);
            return this.okStatus(ctx, CREATED_STATUS, "Variant Created");
        } catch (error) {
            return this.badRequest(ctx, ctx.status, error);
        }
    }

    //Get all Variants for a product
    public async getVariantsForProduct(ctx: IRouterContext) {
        try {
            const id: number = Number(ctx.params.productId);

            if(!id){
                return this.badRequest(ctx, BAD_REQUEST_STATUS, VALID_ID );
            }

            const variant = await this.variantDataRepo.find({
                where: {
                    product: {
                        id: id
                    }
                }
            });

            return this.okStatus(ctx, OK_STATUS, variant);
        } catch (error) {
            return this.badRequest(ctx, NOT_FOUND_STATUS, error);
        }
    }

    //Get Variant by id
    public async getVariantById(ctx: IRouterContext) {
        try {

            const id: number = Number(ctx.params.id);

            if(!id){
                return this.badRequest(ctx, BAD_REQUEST_STATUS, VALID_ID );
            }

            const variant = await this.variantDataRepo.findOne({
                where: {
                    id: id
                }
            });

            if (!variant) {
                return this.badRequest(ctx, NOT_FOUND_STATUS, "Variant Not Found.");
            }

            return this.okStatus(ctx, OK_STATUS, variant);
        } catch (error) {
            return this.badRequest(ctx, ctx.status, error);
        }
    }


    //Update Variant by id
    public async updateVariantById(ctx: IRouterContext) {
        try {

            const id: number = Number(ctx.params.id);

            if(!id){
                return this.badRequest(ctx, BAD_REQUEST_STATUS, VALID_ID );
            }

            const {name, price, inventory} = ctx.request.body as { name: string; price: number; inventory: number; };

            const variant = await this.variantDataRepo.findOne({
                where: {
                    id: id
                }
            });

            if (!variant) {
                return this.badRequest(ctx, NOT_FOUND_STATUS, "Variant Not Found.");
            }

            await this.variantDataRepo.update(id, {
                name: name,
                price: price,
                inventory: inventory
            });

            return this.okStatus(ctx, OK_STATUS, "Variant Updated Successfully.");
        } catch (error) {
            return this.badRequest(ctx, ctx.status, error);
        }
    }


    //Delete Variant by id
    public async deleteVariantById(ctx: IRouterContext): Promise<void> {
        try {

            const id: number = Number(ctx.params.id);

            if(!id){
                return this.badRequest(ctx, BAD_REQUEST_STATUS, VALID_ID );
            }

            const result = await this.variantDataRepo.delete(id);

            if (result.affected === 0) {
                return this.badRequest(ctx, NOT_FOUND_STATUS, "Variant Not Found.");
            }

            return this.okStatus(ctx, OK_STATUS, "Variant Deleted Successfully.");
        } catch (error) {
            return this.badRequest(ctx, ctx.status, error);
        }
    }
}