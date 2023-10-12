import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

interface IErrorResponse {
  statusCode: number;
  message: string;
  path: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse();
    const request = context.getRequest();
    const status = exception.getStatus();

    const errorResponse: IErrorResponse = {
      statusCode: status,
      message: exception.message,
      path: request.url,
    };
    response.status(status).json({ error: errorResponse });
  }
}
