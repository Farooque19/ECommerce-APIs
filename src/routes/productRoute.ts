import Router from "koa-router";
import { ProductController } from "../controllers/ProductController";
import {DBConnection} from "../db/dbConnection";

const productRouter = new Router();
const dbConnect = new DBConnection()
dbConnect.connect();
const productController = new ProductController(dbConnect.getDataSource());

export function ProductRouter() {
    productRouter.post("/api/clients/:id/products", (ctx) => productController.createProductForClient(ctx));

    productRouter.get("/api/clients/:id/products", (ctx)=> productController.getProductForClient(ctx));

    productRouter.get("/api/products/:id", (ctx)=> productController.getProductById(ctx));

    productRouter.put("/api/products/:id", (ctx)=> productController.updateProductById(ctx));

    productRouter.delete("/api/products/:id", (ctx)=> productController.deleteProductById(ctx));

    return productRouter;
}
