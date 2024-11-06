import {Client} from "../entities/Client";
import {IRouterContext} from "koa-router";
import * as statusCodes from "../utils/statusCode"

export class ClientController {
    protected clientDataRepo: any;

    constructor(connection: any) {
        this.clientDataRepo = connection.getRepository(Client);


    }

    //Create new client
    public async createClient(ctx: any) {

        const {name, email} = ctx.request.body as { name: string; email: string };
        const client = new Client();
        client.name = name;
        client.email = email;
        console.log(this.clientDataRepo);
        console.log(await this.clientDataRepo.save(client));
        ctx.body = statusCodes.CREATED_STATUS
        ctx.body = statusCodes.CREATED_STATUS_MESSAGE
    }


    //Get all Clients
    public async getClients(ctx: IRouterContext) {
        const clients = await this.clientDataRepo.find({
            relations: {
                products: true
            }
        });
        if(!clients){
            ctx.status = statusCodes.NOT_FOUND_STATUS;
            ctx.body = statusCodes.NOT_FOUND_MESSAGE;
        }
        ctx.status = statusCodes.OK_STATUS;
        ctx.body = clients;
    }


    //Get Clients by id
    public async getClientById(ctx: IRouterContext) {
        const id = +ctx.params.id;
        const clients = await this.clientDataRepo.findOne({
            where: {
                id: id
            },
            relations: {
                products: true
            }
        });
        if (!clients) {
            ctx.status = statusCodes.NOT_FOUND_STATUS;
            ctx.body = statusCodes.NOT_FOUND_MESSAGE;
            return;
        }
        ctx.body = clients;
        ctx.status = statusCodes.OK_STATUS;
    }


    //Update Client by id
    public async updateClientById(ctx: IRouterContext) {
        const id = +ctx.params.id;
        const {name, email} = ctx.request.body as { name: string; email: string };
        const client = await this.clientDataRepo.findOne({
            where: {
                id: id
            }
        })
        if (!client) {
            ctx.status = statusCodes.NOT_FOUND_STATUS;
            ctx.body = statusCodes.NOT_FOUND_MESSAGE;
            return;
        }
        await this.clientDataRepo.update(id, {
            name: name,
            email: email
        })
        ctx.status = statusCodes.OK_STATUS;
        ctx.body = statusCodes.OK_STATUS_MESSAGE;
    }


    //Delete Client by id
    public async deleteClientById(ctx: IRouterContext) {
        const id = +ctx.params.id;
        const deletedData = await this.clientDataRepo.delete({id});
        if (deletedData.affected === 0) {
            ctx.status = statusCodes.NOT_FOUND_STATUS;
            ctx.body = statusCodes.NOT_FOUND_MESSAGE;
        }
        ctx.status = statusCodes.OK_STATUS;
        ctx.body = statusCodes.OK_STATUS_MESSAGE;
    }
}
