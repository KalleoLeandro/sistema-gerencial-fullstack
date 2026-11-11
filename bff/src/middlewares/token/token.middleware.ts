import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { LoginService } from '@services/login/login.service';
import { Request, Response } from 'express';

@Injectable()
export class TokenMiddleware implements NestMiddleware {
  constructor(private readonly loginService: LoginService) {}

  async use(req: Request & { user?: unknown }, _res: Response, next: () => void) {
    const token = req.cookies?.access_token;

    if (!token) {
      throw new UnauthorizedException('Access token nÃ£o encontrado');
    }

    const validation = await this.loginService.validarToken(token);

    if (!validation.valid) {
      throw new UnauthorizedException('Access token invÃ¡lido ou expirado');
    }

    req.user = validation;
    next();
  }
}
