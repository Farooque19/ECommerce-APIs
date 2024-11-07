import Router from "koa-router";
import { VariantController } from "../controllers/VariantController";

const variantRouter = new Router();

export function VariantRouter(){
    const variantController = new VariantController();

    variantRouter.post("/api/products/:productId/variants", (ctx) => variantController.createVariantForProduct(ctx));

    variantRouter.get("/api/products/:productId/variants", (ctx)=> variantController.getVariantsForProduct(ctx));

    variantRouter.get("/api/variants/:id", (ctx)=> variantController.getVariantById(ctx));

    variantRouter.put("/api/variants/:id", (ctx)=> variantController.updateVariantById(ctx));

    variantRouter.delete("/api/variants/:id", (ctx)=> variantController.deleteVariantById(ctx));

    return variantRouter;
}