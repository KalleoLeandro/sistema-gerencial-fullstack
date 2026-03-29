import { Body, Controller, Get, Param, Post, Query, Req, Res } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProxyService } from '@services/proxy/proxy.service';
import { Request, Response } from 'express';

@ApiTags('Vendas')
@ApiCookieAuth()
@Controller('vendas')
export class VendaController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post('aprovar-orcamento')
  @ApiOperation({ summary: 'Aprova o orcamento e gera a venda' })
  @ApiResponse({ status: 201, description: 'Venda gerada com sucesso' })
  aprovarOrcamento(@Body() body: unknown, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'POST', '/vendas/aprovar-orcamento', body);
  }

  @Get('buscar-por-id/:id')
  @ApiOperation({ summary: 'Busca uma venda por id' })
  @ApiResponse({ status: 200, description: 'Venda encontrada com sucesso' })
  buscarPorId(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'GET', `/vendas/buscar-por-id/${id}`);
  }

  @Get('listar')
  @ApiOperation({ summary: 'Lista vendas paginadas' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'pesquisa', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Vendas listadas com sucesso' })
  listar(
    @Query('page') _page: string,
    @Query('limit') _limit: string,
    @Query('pesquisa') _pesquisa: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.proxyService.forward(req, res, 'GET', '/vendas/listar');
  }
}
