import { Injectable, ExecutionContext, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor(private configService: ConfigService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const clientID = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    if (!clientID || !clientSecret) {
      throw new BadRequestException('Google OAuth2 is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file.');
    }
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err) {
      throw err instanceof UnauthorizedException ? err : new UnauthorizedException('Google authentication failed');
    }
    if (!user) {
      throw new UnauthorizedException('Google authentication failed');
    }
    return user;
  }
}
