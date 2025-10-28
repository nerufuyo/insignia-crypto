import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import type { User } from '@prisma/client';
import { UserService } from '../../modules/user/user.service';

interface RequestWithUser extends Request {
  user: User;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Authentication token is required');
    }

    try {
      const user = await this.userService.findByToken(token);
      request.user = user;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authorization = request.headers.authorization;
    if (!authorization || typeof authorization !== 'string') {
      return undefined;
    }

    // Support both "Bearer token" and just "token" formats
    if (authorization.startsWith('Bearer ')) {
      return authorization.substring(7);
    }

    return authorization;
  }
}
