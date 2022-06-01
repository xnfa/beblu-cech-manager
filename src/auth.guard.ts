import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization =
      request.headers.authorization || request.headers.Authorization;
    if (!authorization) {
      return false;
    }
    const token = authorization.split('Bearer ')[1];
    const ACCESS_TOKEN = this.configService.get<string>('ACCESS_TOKEN');
    return token === ACCESS_TOKEN;
  }
}
