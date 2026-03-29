import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Res } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProxyService } from '@services/proxy/proxy.service';
import { Request, Response } from 'express';

@ApiTags('Produtos')
@ApiCookieAuth()
@Controller('produtos')
export class ProdutoController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post('cadastrar')
  @ApiOperation({ summary: 'Cadastra um produto' })
  @ApiResponse({ status: 201, description: 'Produto cadastrado com sucesso' })
  cadastrar(@Body() body: unknown, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'POST', '/produtos/cadastrar', body);
  }

  @Get('listar')
  @ApiOperation({ summary: 'Lista produtos paginados' })
  @ApiQuery({ name: 'page', required: true, type: Number })
  @ApiQuery({ name: 'limit', required: true, type: Number })
  @ApiResponse({ status: 200, description: 'Produtos listados com sucesso' })
  listar(@Query('page') _page: string, @Query('limit') _limit: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'GET', '/produtos/listar');
  }

  @Get('listar-ativos')
  @ApiOperation({ summary: 'Lista produtos ativos' })
  @ApiResponse({ status: 200, description: 'Produtos ativos listados com sucesso' })
  listarAtivos(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'GET', '/produtos/listar-ativos');
  }

  @Get('buscar-por-id/:id')
  @ApiOperation({ summary: 'Busca um produto por id' })
  @ApiResponse({ status: 200, description: 'Produto encontrado com sucesso' })
  buscarPorId(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'GET', `/produtos/buscar-por-id/${id}`);
  }

  @Put('atualizar')
  @ApiOperation({ summary: 'Atualiza um produto' })
  @ApiResponse({ status: 204, description: 'Produto atualizado com sucesso' })
  atualizar(@Body() body: unknown, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'PUT', '/produtos/atualizar', body);
  }

  @Delete('excluir/:id')
  @ApiOperation({ summary: 'Exclui um produto' })
  @ApiResponse({ status: 204, description: 'Produto excluido com sucesso' })
  excluir(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'DELETE', `/produtos/excluir/${id}`);
  }
}
