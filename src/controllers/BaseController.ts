export class BaseController {
    okStatus(ctx: any, statusCode: number, bodyMessage: any) {
        ctx.status = statusCode;
        ctx.body = bodyMessage;
    }

    badRequest(ctx: any, statusCode: number, bodyMessage: any) {
        ctx.status = statusCode;
        ctx.body = bodyMessage;
    }
}