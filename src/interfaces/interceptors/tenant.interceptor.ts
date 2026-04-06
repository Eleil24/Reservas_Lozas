import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.tenantId;

    // Inject tenantId into the request body or params if needed
    if (request.body && !request.body.tenantId) {
      request.body.tenantId = tenantId;
    }

    return next.handle();
  }
}
