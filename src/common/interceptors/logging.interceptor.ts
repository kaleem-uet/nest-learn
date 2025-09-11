import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();

    const { method, originalUrl, params, query, body } = request;
    const now = Date.now();

    this.logger.log(`Incoming Request: ${method} ${originalUrl}`);
    this.logger.debug(`Params: ${JSON.stringify(params)}`);
    this.logger.debug(`Query: ${JSON.stringify(query)}`);
    this.logger.debug(`Body: ${JSON.stringify(body)}`);

    return next.handle().pipe(
      tap((data) => {
        const delay = Date.now() - now;
        this.logger.log(`Response for ${method} ${originalUrl} - ${delay}ms`);
        this.logger.debug(`Response: ${JSON.stringify(data)}`);
      }),
      catchError((err) => {
        const delay = Date.now() - now;
        this.logger.error(
          `Error in ${method} ${originalUrl} - ${delay}ms`,
          err?.stack || err?.message,
        );
        return throwError(() => err);
      }),
    );
  }
}
