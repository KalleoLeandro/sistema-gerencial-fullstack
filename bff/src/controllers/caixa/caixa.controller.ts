import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProxyService } from '@services/proxy/proxy.service';
import { Request, Response } from 'express';

@ApiTags('Caixa')
@ApiCookieAuth()
@Controller('caixa')
export class CaixaController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get('resumo-dia')
  @ApiOperation({ summary: 'Retorna o resumo do caixa do dia' })
  @ApiResponse({ status: 200, description: 'Resumo do caixa retornado com sucesso' })
  resumoDia(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'GET', '/caixa/resumo-dia');
  }

  @Post('fechar')
  @ApiOperation({ summary: 'Fecha o caixa do dia' })
  @ApiResponse({ status: 200, description: 'Caixa fechado com sucesso' })
  fechar(@Body() body: unknown, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'POST', '/caixa/fechar', body);
  }
}
