import Router from "koa-router";
import { VariantController } from "../controllers/variantController";
import {DBConnection} from "../db/dbConnection";

const variantRouter = new Router();
const dbConnect = new DBConnection();
dbConnect.connect();
const variantController = new VariantController(dbConnect.getDataSource());

export function VariantRouter(){
    variantRouter.post("/api/products/:productId/variants", (ctx) => variantController.createVariantForProduct(ctx));

    variantRouter.get("/api/products/:productId/variants", (ctx)=> variantController.getVariantsForProduct(ctx));

    variantRouter.get("/api/variants/:id", (ctx)=> variantController.getVariantById(ctx));

    variantRouter.put("/api/variants/:id", (ctx)=> variantController.updateVariantById(ctx));

    variantRouter.delete("/api/variants/:id", (ctx)=> variantController.deleteVariantById(ctx));

    return variantRouter;
}