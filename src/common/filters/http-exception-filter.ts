import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus
} from "@nestjs/common";
import { Request, Response } from "express";


@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse<Response>();
        const req = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let code = 'INTERNAL_SERVER_ERROR';
        let details = null;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const response = exception.getResponse() as any;

            message = response.message || exception.message;
            code = response.error || 'HTTP_EXCEPTION';
            details = response;
        }

        res.status(status).json({
            success: false,
            message,
            error: {
                code,
                details
            },
            path: req.url,
            timestamp: new Date().toISOString()
        })
    }
}