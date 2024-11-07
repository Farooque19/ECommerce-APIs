import "reflect-metadata";
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { ClientRouter } from "./routes/ClientRoute"
import { ProductRouter } from "./routes/ProductRoute";
import { VariantRouter } from "./routes/VariantRoute";

(async () => {
    const app = new Koa();

    const PORT = process.env.PORT || 3000;
    const clientRoutes = ClientRouter();
    const productRoutes = ProductRouter();
    const variantRoutes = VariantRouter();

    app.use(bodyParser());

    app.use(clientRoutes.routes()).use(clientRoutes.allowedMethods());
    app.use(productRoutes.routes()).use(productRoutes.allowedMethods());
    app.use(variantRoutes.routes()).use(variantRoutes.allowedMethods());

    app.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`);
    });
})();






