export class BaseController {
    okStatus(ctx: any, statusCode: number, message?: any, data?: any) {
        ctx.status = statusCode;
        message ? ctx.body = {message: message} : '';
        data ? ctx.body = {data: data} : '';
    }

    badRequest(ctx: any, statusCode: number, bodyMessage: any) {
        ctx.status = statusCode;
        ctx.body = {error: bodyMessage};
    }
}