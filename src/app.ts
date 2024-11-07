import "reflect-metadata";
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import {ClientRouter} from "./routes/ClientRoute"
import {ProductRouter} from "./routes/ProductRoute";
import {VariantRouter} from "./routes/VariantRoute";
import {DBConnection} from "./db/DBConnection";
import Router from "koa-router";

(async () => {

    const app = new Koa();

    const dbConnect = new DBConnection()
    const connection = await dbConnect.connect();

    const PORT = process.env.PORT || 3000;

    const clientRoutes = ClientRouter(connection);
    const productRoutes = ProductRouter(connection);
    const variantRoutes = VariantRouter(connection);

    const router = new Router();

    router.use(clientRoutes.routes()).use(clientRoutes.allowedMethods());
    router.use(productRoutes.routes()).use(productRoutes.allowedMethods());
    router.use(variantRoutes.routes()).use(variantRoutes.allowedMethods());

    app.use(bodyParser());
    app.use(router.routes()).use(clientRoutes.allowedMethods());

    app.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`);
    });
})();






