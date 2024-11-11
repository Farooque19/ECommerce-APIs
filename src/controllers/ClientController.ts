import {Client} from "../entities/Client";
import {IRouterContext} from "koa-router";
import {
    BAD_REQUEST_STATUS, CREATED_STATUS, NOT_FOUND_STATUS, OK_STATUS, VALID_ID
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
        try {

            const {name, email} = ctx.request.body as { name: string; email: string };

            if (!name || !email) {
                return this.badRequest(ctx, BAD_REQUEST_STATUS, "Please provide name and email.");
            }

            const client = new Client();
            client.name = name;
            client.email = email;
            await this.clientDataRepo.save(client);
            return this.okStatus(ctx, CREATED_STATUS, "Client Created Successfully.");
        } catch (error) {
            return this.badRequest(ctx, ctx.status, error);
        }
    }


    //Get all Clients
    public async getClients(ctx: IRouterContext) {
        try {

            const clients = await this.clientDataRepo.find();

            if(!clients){
                return this.badRequest(ctx, NOT_FOUND_STATUS, "Client Not Found.");
            }

            return this.okStatus(ctx, OK_STATUS, clients);
        } catch (error) {
            return this.badRequest(ctx, ctx.status, "Clients Not Found");
        }
    }


    //Get Clients by id
    public async getClientById(ctx: IRouterContext) {
        try {

            const id: number = Number(ctx.params.id);

            if(!id){
                return this.badRequest(ctx, BAD_REQUEST_STATUS, VALID_ID );
            }

            const clients = await this.clientDataRepo.findOne({
                where: {
                    id: id
                }
            });

            if (!clients) {
                return this.badRequest(ctx, NOT_FOUND_STATUS, "Client Not Found.");
            }

            return this.okStatus(ctx, OK_STATUS, clients);
        } catch (error) {
            return this.badRequest(ctx, ctx.status, error);
        }
    }


    //Update Client by id
    public async updateClientById(ctx: IRouterContext) {
        try {

            const id: number = Number(ctx.params.id);

            if(!id){
                return this.badRequest(ctx, BAD_REQUEST_STATUS, VALID_ID );
            }

            const {name, email} = ctx.request.body as { name: string; email: string };

            const client = await this.clientDataRepo.findOne({
                where: {
                    id: id
                }
            });

            if (!client) {
                return this.badRequest(ctx, NOT_FOUND_STATUS, "Client Not Found.");
            }

            await this.clientDataRepo.update(id, {
                name: name,
                email: email
            })
            return this.okStatus(ctx, OK_STATUS, "Client Data Updated Successfully.")
        } catch (error) {
            return this.badRequest(ctx, ctx.status, error);
        }
    }


    //Delete Client by id
    public async deleteClientById(ctx: IRouterContext) {
        try {

            const id: number = Number(ctx.params.id);

            if(!id){
                return this.badRequest(ctx, BAD_REQUEST_STATUS, VALID_ID );
            }

            const deletedData = await this.clientDataRepo.delete({id});

            if (deletedData.affected === 0) {
                return this.badRequest(ctx, NOT_FOUND_STATUS, "Client Not Found.")
            }

            ctx.body = deletedData;
            return this.okStatus(ctx, OK_STATUS, "Client Data Deleted Successfully.");
        } catch (error) {
            return this.badRequest(ctx, ctx.status, error);
        }
    }
}
