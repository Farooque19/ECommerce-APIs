import "reflect-metadata";
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import Router from 'koa-router';
import { Product } from './entities/Product';
import { DataSource } from "typeorm";
import { Client } from "./entities/Client";
import { Variant } from "./entities/Variant";

const app = new Koa();
const router = new Router();

const postgresDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "asdf",
    database: "ecommerce",
    entities: ['src/entities/*.ts'],
    synchronize: true,
});

const PORT = process.env.PORT || 3000;

postgresDataSource.initialize()
    .then(() => {
        console.log("Database connected successfully.");
        const clientDataRepo = postgresDataSource.getRepository(Client);
        const productDataRepo = postgresDataSource.getRepository(Product);
        const variantDataRepo = postgresDataSource.getRepository(Variant);


        //Create Client
        router.post("/api/clients", async (ctx) => {
            const {name, email} = ctx.request.body as { name: string; email: string };
            const client = new Client();
            client.name = name;
            client.email = email;
            await clientDataRepo.save(client);
            ctx.body = "Record Inserted."
        });

        //Get all Clients
        router.get("/api/clients", async (ctx) => {
            const client = await clientDataRepo.find({
                relations: {
                    products: true
                }
            });
            if(!client){
                ctx.status = 404;
                ctx.body = "Not Found";
                return;
            }
            ctx.body = client;
            ctx.status = 200;
        });

        //Get Client By id
        router.get("/api/clients/:id", async (ctx) => {
            const id = +ctx.params.id;
            const client = await clientDataRepo.findOne({
                where:{
                    id: id
                },
                relations: {
                    products: true
                }
            });
            if(!client){
                ctx.status = 404;
                ctx.body = "Not Found";
                return;
            }
            ctx.body = client;
            ctx.status = 200;
        });

        //Update Client Records
        router.put("/api/clients/:id", async (ctx) => {
            const id = ctx.params.id;
            const { name, email } = ctx.request.body as { name: string; email: string };
            await clientDataRepo.update(id,{
                name: name,
                email: email
            });
            ctx.status = 200;
            ctx.body = "Record Updated.";
        });

        //Delete Client Based on id
        router.delete("/api/clients/:id", async (ctx) => {
            const id = ctx.params.id;
            const result = await clientDataRepo.delete(id);
            if (result.affected === 0) {
                ctx.status = 404;
                ctx.body = "Client not found.";
                return;
            }
            ctx.status = 200;
            ctx.body = "Record Deleted.";
        });


        //Create Product for Client
        router.post("/api/clients/:clientId/products", async (ctx) => {
            const id = ctx.params.clientId;
            const { name, description, options } = ctx.request.body as { name: string; description: string; options?: { [key: string]: string[] }; };
            const client = await clientDataRepo.findOne({
                where: {
                    id: +id
                }
            });
            const prod = new Product();
            prod.name = name;
            prod.description = description;
            prod.client = client;
            prod.options = options;
            await productDataRepo.save(prod);
            ctx.status = 200;
            ctx.body = "Record Inserted.";
        });



        //Get All Products for a client
        router.get("/api/clients/:clientId/products", async (ctx) => {
            const id = ctx.params.clientId;
            const product = await productDataRepo.find({
                where: {
                    client: {
                        id: +id
                    }},
                relations: {
                    variant: true
                } // Include variants if needed
            });
            if(!product || product.length === 0) {
                ctx.status = 404;
                ctx.body = "Products not found.";
                return;
            }
            ctx.status = 200;
            ctx.body = product;
        });

        //Get products by product id
        router.get("/api/products/:id", async (ctx) => {
            const id = +ctx.params.id;
            const product = await productDataRepo.findOne({
                where: { id },
                relations: {
                    variant: true
                }
            });
            if(!product){
                ctx.status = 404;
                ctx.body = "Not Found";
                return;
            }
            ctx.status = 200;
            ctx.body = product;
        });

        //Update product by product id
        router.put("/api/products/:id", async (ctx) => {
            const id = +ctx.params.id;
            const { name, description } = ctx.request.body as { name: string; description: string; };
            const product = await productDataRepo.findOneBy({ id });
            if (!product) {
                ctx.status = 404;
                ctx.body = "Product not found.";
                return;
            }
            product.name = name;
            product.description = description;
            await productDataRepo.save(product);
            ctx.body = "Product record updated.";
        });

        //Delete product by product id
        router.delete("/api/products/:id", async (ctx) => {
            const id = ctx.params.id;
            const result = await productDataRepo.delete(id);
            if (result.affected === 0) {
                ctx.status = 404;
                ctx.body = "Product not found.";
                return;
            }
            ctx.body = "Product record deleted.";
        });

        //Create Variant for product
        router.post("/api/products/:productId/variants", async (ctx) => {
            const productId = ctx.params.productId;
            const { priceMapping } = ctx.request.body as { priceMapping: { [key: string]: number } };

            const product = await productDataRepo.findOne({
                where: {
                    id: +productId
                }
            });

            if (!product) {
                ctx.status = 404;
                ctx.body = "Product not found.";
                return;
            }

            const { options } = product;
            if (!options || !options.color || !options.size) {
                ctx.status = 400;
                ctx.body = "Product does not have options (e.g., color or size) to create variants.";
                return;
            }

            const variants = generateVariants(options, priceMapping, product);

            await variantDataRepo.save(variants);
            ctx.status = 200;
            ctx.body = "Variants created successfully.";
        });

        function generateVariants(options: { [key: string]: string[] }, priceMapping: { [key: string]: number }, product: Product): Variant[] {
            const variants: Variant[] = [];

            // Loop through each key in options to create variant combinations
            const colors = options.color || [];
            const sizes = options.size || [];

            colors.forEach(color => {
                sizes.forEach(size => {
                    const variantName = `${color} / ${size}`; // e.g., "Red / S"
                    const variantPrice = priceMapping[variantName] || 0; // Get price from mapping or default to 0

                    const variant = new Variant(); // Create new Variant instance
                    variant.name = variantName;
                    variant.price = variantPrice;
                    variant.product = product; // Link the variant to the product
                    variants.push(variant); // Add the variant to the array
                });
            });

            return variants;
        }


        //Get all variants for a product
        router.get("/api/products/:productId/variants", async (ctx) => {
            const id = ctx.params.productId;
            const variant = await variantDataRepo.find({
                where: {
                    product: {
                        id: +id
                    }
                }
            });
            if(!variant){
                ctx.status = 404;
                ctx.body = "Not Found";
                return;
            }
            ctx.body = variant;
            ctx.status = 200;
        });


        //Get Variant by id
        router.get("/api/variants/:id", async (ctx) => {
            const id = ctx.params.id;
            const variant = await variantDataRepo.findOne({
                where: {
                    id: +id
                }
            });
            if(!variant){
                ctx.status = 404;
                ctx.body = "Not Found";
                return;
            }
            ctx.body = variant;
            ctx.status = 200;
        });


        //Update variant based on id
        router.put("/api/variants/:id", async (ctx) => {
            const id = +ctx.params.id;
            const { name, price, inventory } = ctx.request.body as { name: string; price: number; inventory: number; };
            await variantDataRepo.update(id, {
                name: name,
                price: price,
                inventory: inventory
            });
            ctx.status = 200;
            ctx.body = "Variant record updated.";
        });


        //Delete variant based on id
        router.delete("/api/variants/:id", async (ctx) => {
            const id = ctx.params.id;
            await variantDataRepo.delete(id);
            ctx.status = 200;
            ctx.body = "Variant record deleted.";
        });

        app.use(bodyParser());
        app.use(router.routes()).use(router.allowedMethods());

        app.listen(PORT, () => {
            console.log(`Listening on port ${PORT}`);
        })
})
.catch((error) => {
    console.error(`Error occurred while initialize database: ${error}`);
});

