import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { catchError, Observable, tap, throwError } from "rxjs";

@Injectable()
export class ReqInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req: Request = context.switchToHttp().getRequest();
    if (req.headers['aurora']) {
      return next.handle().pipe(
        catchError((err) => {
          console.error('Intercept an error from 3rd API');
          return throwError({ ...err, message: 'Intercept an error from 3rd API' });
        }),
      );
    }
    return throwError(() => new BadRequestException({message: 'Not from aurora api ...'}))
  }
}
