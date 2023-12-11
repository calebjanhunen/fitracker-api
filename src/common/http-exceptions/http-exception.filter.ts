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
    const res = context.getResponse();
    const req = context.getRequest();

    const status = exception.getStatus();
    const message = exception['response']['message'];
    console.log(message);

    const errorResponse: IErrorResponse = {
      statusCode: status,
      message: message,
      path: req.url,
    };
    res.status(status).json({ error: errorResponse });
  }
}
