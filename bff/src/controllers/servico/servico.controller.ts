import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Res } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProxyService } from '@services/proxy/proxy.service';
import { Request, Response } from 'express';

@ApiTags('Servicos')
@ApiCookieAuth()
@Controller('servicos')
export class ServicoController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post('cadastrar')
  @ApiOperation({ summary: 'Cadastra um servico' })
  @ApiResponse({ status: 201, description: 'Servico cadastrado com sucesso' })
  cadastrar(@Body() body: unknown, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'POST', '/servicos/cadastrar', body);
  }

  @Get('listar')
  @ApiOperation({ summary: 'Lista servicos paginados' })
  @ApiQuery({ name: 'page', required: true, type: Number })
  @ApiQuery({ name: 'limit', required: true, type: Number })
  @ApiResponse({ status: 200, description: 'Servicos listados com sucesso' })
  listar(@Query('page') _page: string, @Query('limit') _limit: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'GET', '/servicos/listar');
  }

  @Get('listar-ativos')
  @ApiOperation({ summary: 'Lista servicos ativos' })
  @ApiResponse({ status: 200, description: 'Servicos ativos listados com sucesso' })
  listarAtivos(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'GET', '/servicos/listar-ativos');
  }

  @Get('buscar-por-id/:id')
  @ApiOperation({ summary: 'Busca um servico por id' })
  @ApiResponse({ status: 200, description: 'Servico encontrado com sucesso' })
  buscarPorId(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'GET', `/servicos/buscar-por-id/${id}`);
  }

  @Put('atualizar')
  @ApiOperation({ summary: 'Atualiza um servico' })
  @ApiResponse({ status: 204, description: 'Servico atualizado com sucesso' })
  atualizar(@Body() body: unknown, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'PUT', '/servicos/atualizar', body);
  }

  @Delete('excluir/:id')
  @ApiOperation({ summary: 'Exclui um servico' })
  @ApiResponse({ status: 204, description: 'Servico excluido com sucesso' })
  excluir(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'DELETE', `/servicos/excluir/${id}`);
  }
}
