import {Client} from "../entities/Client";
import {DBConnection} from "../db/dbConnection";
import {IRouterContext} from "koa-router";

// const clientDataRepo = dbConnect.postgresDataSource.getRepository(Client);

export class ClientController {
    protected clientDataRepo: any;

    constructor(connection: any) {
        this.clientDataRepo = connection.getRepository(Client);


    }

    //Create new client
    public async createClient(ctx: any) {

        // this.clientDataRepo = (await dbConnect.connect()).getRepository(Client);
        const {name, email} = ctx.request.body as { name: string; email: string };
        const client = new Client();
        client.name = name;
        client.email = email;
        // const
        console.log(this.clientDataRepo);
        console.log(await this.clientDataRepo.save(client));
        ctx.body = "Record Inserted."
    }


    //Get all Clients
    public async getClients(ctx: IRouterContext) {
        const clients = await this.clientDataRepo.find({
            relations: {
                products: true
            }
        });
        await this.clientDataRepo.save(clients);
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
            ctx.status = 404;
            ctx.body = "Not Found";
            return;
        }
        ctx.body = clients;
        ctx.status = 200;
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
            ctx.status = 404;
            ctx.body = "Not Found";
            return;
        }
        await this.clientDataRepo.update(id, {
            name: name,
            email: email
        })
        ctx.status = 200;
        ctx.body = "Record Updated.";
    }


    //Delete Client by id
    public async deleteClientById(ctx: IRouterContext) {
        const id = +ctx.params.id;
        const deletedData = await this.clientDataRepo.delete({id});
        if (deletedData.affected === 0) {
            ctx.status = 404;
            ctx.body = "Client not found.";
        }
        ctx.status = 200;
        ctx.body = "Client Data Deleted";
    }
}
