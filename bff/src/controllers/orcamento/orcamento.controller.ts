import { Body, Controller, Get, Param, Post, Put, Query, Req, Res } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProxyService } from '@services/proxy/proxy.service';
import { Request, Response } from 'express';

@ApiTags('Orcamentos')
@ApiCookieAuth()
@Controller('orcamentos')
export class OrcamentoController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get('buscar-por-id/:id')
  @ApiOperation({ summary: 'Busca um orcamento por id' })
  @ApiResponse({ status: 200, description: 'Orcamento encontrado com sucesso' })
  buscarPorId(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'GET', `/orcamentos/buscar-por-id/${id}`);
  }

  @Get('buscar-por-origem')
  @ApiOperation({ summary: 'Busca o orcamento vinculado a uma origem' })
  @ApiQuery({ name: 'origemTipo', required: true, type: String })
  @ApiQuery({ name: 'origemId', required: true, type: Number })
  @ApiResponse({ status: 200, description: 'Orcamento encontrado com sucesso' })
  buscarPorOrigem(
    @Query('origemTipo') _origemTipo: string,
    @Query('origemId') _origemId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.proxyService.forward(req, res, 'GET', '/orcamentos/buscar-por-origem');
  }

  @Get('listar')
  @ApiOperation({ summary: 'Lista orcamentos paginados' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'pesquisa', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Orcamentos listados com sucesso' })
  listar(
    @Query('page') _page: string,
    @Query('limit') _limit: string,
    @Query('pesquisa') _pesquisa: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.proxyService.forward(req, res, 'GET', '/orcamentos/listar');
  }

  @Post('criar-pdv')
  @ApiOperation({ summary: 'Cria um orcamento de PDV' })
  @ApiResponse({ status: 201, description: 'Orcamento PDV criado com sucesso' })
  criarPdv(@Body() body: unknown, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'POST', '/orcamentos/criar-pdv', body);
  }

  @Put('atualizar-itens')
  @ApiOperation({ summary: 'Atualiza os itens do orcamento' })
  @ApiResponse({ status: 200, description: 'Orcamento atualizado com sucesso' })
  atualizarItens(@Body() body: unknown, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'PUT', '/orcamentos/atualizar-itens', body);
  }

  @Put('rejeitar')
  @ApiOperation({ summary: 'Rejeita o orcamento' })
  @ApiResponse({ status: 200, description: 'Orcamento rejeitado com sucesso' })
  rejeitar(@Body() body: unknown, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'PUT', '/orcamentos/rejeitar', body);
  }

  @Put('reabrir')
  @ApiOperation({ summary: 'Reabre um orcamento rejeitado' })
  @ApiResponse({ status: 200, description: 'Orcamento reaberto com sucesso' })
  reabrir(@Body() body: unknown, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'PUT', '/orcamentos/reabrir', body);
  }
}
