import Router from 'koa-router';
import {ClientController} from "../controllers/clientController";
import {DBConnection} from "../db/dbConnection";

const clientRouters = new Router();
const dbConnect= new DBConnection()
dbConnect.connect();
const clientController = new ClientController(dbConnect.getDataSource());

export function ClientRouter(){
    clientRouters.post("/api/clients", (ctx)=>clientController.createClient(ctx));

    clientRouters.get("/api/clients", (ctx) => clientController.getClients(ctx));

    clientRouters.get("/api/clients/:id", (ctx)=> clientController.getClientById(ctx));

    clientRouters.put("/api/clients/:id", (ctx)=> clientController.updateClientById(ctx));

    clientRouters.delete("/api/clients/:id", (ctx)=> clientController.deleteClientById(ctx));

    return clientRouters;
}


