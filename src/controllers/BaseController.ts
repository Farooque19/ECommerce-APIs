export class BaseController {
    okStatus(ctx: any, statusCode: number, statusMessage: any) {
        ctx.status = statusCode;
        ctx.message = statusMessage;
    }

    badRequest(ctx: any, statusCode: number, message: any) {
        ctx.status = statusCode;
        ctx.message = message;
    }
}