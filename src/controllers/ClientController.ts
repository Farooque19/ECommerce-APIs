import {Client} from "../entities/Client";
import {IRouterContext} from "koa-router";
import {
    BAD_REQUEST_MESSAGE,
    BAD_REQUEST_STATUS, CREATED_STATUS, CREATED_STATUS_MESSAGE,
    NOT_FOUND_MESSAGE, NOT_FOUND_STATUS, OK_STATUS, OK_STATUS_MESSAGE
} from "../utils/StatusCode";
import {BaseController} from "./BaseController";
import {Repository} from "typeorm";

export class ClientController extends BaseController {
    protected clientDataRepo: Repository<Client>;

    constructor(connection: any) {
        super();
        this.clientDataRepo = connection.getRepository(Client);
    }

    //Create new client
    public async createClient(ctx: any) {

        const {name, email} = ctx.request.body as { name: string; email: string };

        if (!name && !email) {
            return this.badRequest(ctx, BAD_REQUEST_STATUS, BAD_REQUEST_MESSAGE);
        }

        const client = new Client();
        client.name = name;
        client.email = email;
        await this.clientDataRepo.save(client);
        this.okStatus(ctx, CREATED_STATUS, CREATED_STATUS_MESSAGE);
    }


    //Get all Clients
    public async getClients(ctx: IRouterContext) {
        const clients = await this.clientDataRepo.find({
            relations: {
                products: true
            }
        });

        if (!clients) {
            this.badRequest(ctx, BAD_REQUEST_STATUS, BAD_REQUEST_MESSAGE)
        }

        this.okStatus(ctx, OK_STATUS, OK_STATUS_MESSAGE)
        ctx.body = clients;
    }


    //Get Clients by id
    public async getClientById(ctx: IRouterContext) {
        const id = +ctx.params.id;

        const clients = await this.clientDataRepo.find({
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

        if (isNaN(id) || id <= 0) {
            return this.badRequest(ctx, BAD_REQUEST_STATUS, BAD_REQUEST_MESSAGE);
        }

        const {name, email} = ctx.request.body as { name: string; email: string };
        const client = await this.clientDataRepo.find({
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

        if (isNaN(id) || id <= 0 || (!id)) {
            return this.badRequest(ctx, BAD_REQUEST_STATUS, BAD_REQUEST_MESSAGE);
        }

        const clientData = await this.clientDataRepo.find({
            where: {
                id: id
            }
        })

        if (!clientData) {
            return this.badRequest(ctx, NOT_FOUND_STATUS, NOT_FOUND_MESSAGE);
        }

        const deletedData = await this.clientDataRepo.delete({id});
        if (deletedData.affected === 0) {
            this.badRequest(ctx, NOT_FOUND_STATUS, NOT_FOUND_MESSAGE)
        }
        ctx.body = deletedData;
        this.okStatus(ctx, OK_STATUS, OK_STATUS_MESSAGE)
    }
}
