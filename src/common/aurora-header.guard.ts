import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class AuroraHeaderGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    // Preserve the shared mobile protocol: the value is not platform-specific.
    if (!request.headers.aurora) {
      throw new BadRequestException('Not from aurora...');
    }
    return true;
  }
}
