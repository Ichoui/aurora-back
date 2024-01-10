import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';
import { error } from 'firebase-functions/logger';

@Injectable()
export class ReqInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req: Request = context.switchToHttp().getRequest();
    if (req.headers['aurora']) {
      return next.handle().pipe(
        catchError(e => {
          error(e, 'error from 3rd API')
          return throwError(() => 'Intercept an error from 3rd API :::' + e);
        }),
      );
    }
    return throwError(() => new BadRequestException('Not from aurora...', { cause: new Error() }));
  }
}
