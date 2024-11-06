import Router from 'koa-router';
import {ClientController} from "../controllers/clientController";

const clientRouters = new Router();

export function ClientRouter(connection: any) {

    const clientController = new ClientController(connection);

    clientRouters.post("/api/clients", (ctx) => clientController.createClient(ctx));

    clientRouters.get("/api/clients", (ctx) => clientController.getClients(ctx));

    clientRouters.get("/api/clients/:id", (ctx) => clientController.getClientById(ctx));

    clientRouters.put("/api/clients/:id", (ctx) => clientController.updateClientById(ctx));

    clientRouters.delete("/api/clients/:id", (ctx) => clientController.deleteClientById(ctx));

    return clientRouters;
}


