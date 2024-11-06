import Router from "koa-router";
import { ProductController } from "../controllers/ProductController";

const productRouter = new Router();

export function ProductRouter(connection: any) {
    const productController = new ProductController(connection);

    productRouter.post("/api/clients/:id/products", (ctx) => productController.createProductForClient(ctx));

    productRouter.get("/api/clients/:id/products", (ctx)=> productController.getProductForClient(ctx));

    productRouter.get("/api/products/:id", (ctx)=> productController.getProductById(ctx));

    productRouter.put("/api/products/:id", (ctx)=> productController.updateProductById(ctx));

    productRouter.delete("/api/products/:id", (ctx)=> productController.deleteProductById(ctx));

    return productRouter;
}
