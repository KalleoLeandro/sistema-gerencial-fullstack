import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProxyService } from '@services/proxy/proxy.service';
import { Request, Response } from 'express';

@ApiTags('Clientes')
@ApiCookieAuth()
@Controller('clientes')
export class ClienteController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get('buscar-por-documento')
  @ApiOperation({ summary: 'Busca cliente por documento' })
  @ApiQuery({ name: 'documento', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Cliente encontrado com sucesso' })
  buscarPorDocumento(
    @Query('documento') _documento: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.proxyService.forward(req, res, 'GET', '/clientes/buscar-por-documento');
  }

  @Get('buscar')
  @ApiOperation({ summary: 'Busca clientes por nome ou documento' })
  @ApiQuery({ name: 'termo', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Clientes encontrados com sucesso' })
  buscar(
    @Query('termo') _termo: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.proxyService.forward(req, res, 'GET', '/clientes/buscar');
  }
}
