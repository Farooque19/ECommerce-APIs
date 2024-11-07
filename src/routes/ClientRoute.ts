import Router from 'koa-router';
import {ClientController} from "../controllers/ClientController";

const clientRouters = new Router();

export function ClientRouter( ) {

    const clientController = new ClientController();

    clientRouters.post("/api/clients", (ctx) => clientController.createClient(ctx));

    clientRouters.get("/api/clients", (ctx) => clientController.getClients(ctx));

    clientRouters.get("/api/clients/:id", (ctx) => clientController.getClientById(ctx));

    clientRouters.put("/api/clients/:id", (ctx) => clientController.updateClientById(ctx));

    clientRouters.delete("/api/clients/:id", (ctx) => clientController.deleteClientById(ctx));

    return clientRouters;
}


