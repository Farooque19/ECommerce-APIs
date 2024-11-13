import {Client} from "../entities/Client";
import {IRouterContext} from "koa-router";
import {
    BAD_REQUEST_STATUS,
    CREATED_STATUS,
    NOT_FOUND_STATUS,
    OK_STATUS,
    INTERNAL_SERVER_ERROR_MESSAGE,
    INTERNAL_SERVER_ERROR_CODE
} from "../utils/StatusCode";
import {BaseController} from "./BaseController";
import {DataSource, Repository} from "typeorm";

export class ClientController extends BaseController {
    protected clientDataRepo: Repository<Client>;

    constructor(connection: DataSource) {
        super();
        this.clientDataRepo = connection.getRepository(Client);
    }

    //Create new client
    public async createClient(ctx: IRouterContext): Promise<void> {
        try {
            const {name, email} = ctx.request.body as { name: string; email: string };

            if (!name || !email)
                return this.badRequest(ctx, BAD_REQUEST_STATUS, "Please provide name and email.");

            const client = new Client();
            client.name = name;
            client.email = email;
            await this.clientDataRepo.save(client);
            return this.okStatus(ctx, CREATED_STATUS, "Client Created Successfully.");
        } catch (error) {
            return this.badRequest(ctx, INTERNAL_SERVER_ERROR_CODE, INTERNAL_SERVER_ERROR_MESSAGE);
        }
    }


    //Get all Clients
    public async getClients(ctx: IRouterContext): Promise<void> {
        try {
            const clients = await this.clientDataRepo.find();
            return this.okStatus(ctx, OK_STATUS, undefined, clients);
        } catch (error) {
            return this.badRequest(ctx, INTERNAL_SERVER_ERROR_CODE, INTERNAL_SERVER_ERROR_MESSAGE);
        }
    }


    //Get Clients by id
    public async getClientById(ctx: IRouterContext): Promise<void> {
        try {
            const id: number = Number(ctx.params.id);
            const clients = await this.clientDataRepo.findOne({
                where: {
                    id: id
                }
            });

            if (!clients)
                return this.badRequest(ctx, NOT_FOUND_STATUS, "Client Not Found.");

            return this.okStatus(ctx, OK_STATUS, undefined, clients);
        } catch (error) {
            return this.badRequest(ctx, INTERNAL_SERVER_ERROR_CODE, INTERNAL_SERVER_ERROR_MESSAGE);
        }
    }


    //Update Client by id
    public async updateClientById(ctx: IRouterContext): Promise<void> {
        try {
            const id: number = Number(ctx.params.id);
            const {name, email} = ctx.request.body as { name: string; email: string };
            const client = await this.clientDataRepo.findOne({
                where: {
                    id: id
                }
            });

            if (!client)
                return this.badRequest(ctx, NOT_FOUND_STATUS, "Client Not Found.");

            await this.clientDataRepo.update(id, {
                name: name,
                email: email
            })
            return this.okStatus(ctx, OK_STATUS, "Client Data Updated Successfully.")
        } catch (error) {
            return this.badRequest(ctx, INTERNAL_SERVER_ERROR_CODE, INTERNAL_SERVER_ERROR_MESSAGE);
        }
    }


    //Delete Client by id
    public async deleteClientById(ctx: IRouterContext): Promise<void> {
        try {
            const id: number = Number(ctx.params.id);
            const deletedData = await this.clientDataRepo.delete({id});

            if (deletedData.affected === 0)
                return this.badRequest(ctx, NOT_FOUND_STATUS, "Client Not Found.")

            return this.okStatus(ctx, OK_STATUS, "Client Data Deleted Successfully.");
        } catch (error) {
            return this.badRequest(ctx, INTERNAL_SERVER_ERROR_CODE, INTERNAL_SERVER_ERROR_MESSAGE);
        }
    }
}
