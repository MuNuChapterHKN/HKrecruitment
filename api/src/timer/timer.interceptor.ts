import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { catchError, Observable, tap } from 'rxjs';


@Injectable()
export class TimerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TimerInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTimer = Date.now();
    const logTimer = () => this.logger.log(`Request took ${Date.now() - startTimer}ms`);
    return next
      .handle()
      .pipe(
        tap(logTimer),
        catchError((error: Error) => {
          logTimer();
          throw(error); 
        })
      );
  }
}
