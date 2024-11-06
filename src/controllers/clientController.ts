import {Client} from "../entities/Client";
import {IRouterContext} from "koa-router";
import {
    BAD_REQUEST_MESSAGE,
    BAD_REQUEST_STATUS, CREATED_STATUS, CREATED_STATUS_MESSAGE,
    INTERNAL_SERVER_ERROR_MESSAGE,
    INTERNAL_SERVER_ERROR_STATUS, NOT_FOUND_MESSAGE, NOT_FOUND_STATUS, OK_STATUS, OK_STATUS_MESSAGE
} from "../utils/statusCode";
import {BaseController} from "./baseController";

export class ClientController extends BaseController {
    protected clientDataRepo: any;

    constructor(connection: any) {
        super();
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
        this.okStatus(ctx, CREATED_STATUS, CREATED_STATUS_MESSAGE);
    }


    //Get all Clients
    public async getClients(ctx: IRouterContext) {
        const clients = await this.clientDataRepo.find({
            relations: {
                products: true
            }
        });
        if(!clients){
            this.badRequest(ctx, BAD_REQUEST_STATUS, BAD_REQUEST_MESSAGE)
        }
        this.okStatus(ctx, OK_STATUS, OK_STATUS_MESSAGE)
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
            this.badRequest(ctx, NOT_FOUND_STATUS, NOT_FOUND_MESSAGE)
            return;
        }
        ctx.body = clients;
        this.okStatus(ctx, OK_STATUS, OK_STATUS_MESSAGE)
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
            this.badRequest(ctx, BAD_REQUEST_STATUS, BAD_REQUEST_MESSAGE)
            return;
        }
        await this.clientDataRepo.update(id, {
            name: name,
            email: email
        })
        this.okStatus(ctx, OK_STATUS, OK_STATUS_MESSAGE)
    }


    //Delete Client by id
    public async deleteClientById(ctx: IRouterContext) {
        const id = +ctx.params.id;
        const deletedData = await this.clientDataRepo.delete({id});
        if (deletedData.affected === 0) {
            this.badRequest(ctx, NOT_FOUND_STATUS, NOT_FOUND_MESSAGE)
        }
        this.okStatus(ctx, OK_STATUS, OK_STATUS_MESSAGE)
    }
}
