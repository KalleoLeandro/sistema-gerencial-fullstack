import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Res } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProxyService } from '@services/proxy/proxy.service';
import { Request, Response } from 'express';

@ApiTags('Agendamento')
@ApiCookieAuth()
@Controller('agendamento')
export class AgendamentoController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post('cadastrar')
  @ApiOperation({ summary: 'Cadastra um agendamento' })
  @ApiResponse({ status: 201, description: 'Agendamento cadastrado com sucesso' })
  cadastrar(@Body() body: unknown, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'POST', '/agendamento/cadastrar', body);
  }

  @Get('listar')
  @ApiOperation({ summary: 'Lista agendamentos paginados' })
  @ApiQuery({ name: 'page', required: true, type: Number })
  @ApiQuery({ name: 'limit', required: true, type: Number })
  @ApiResponse({ status: 200, description: 'Agendamentos listados com sucesso' })
  listar(@Query('page') _page: string, @Query('limit') _limit: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'GET', '/agendamento/listar');
  }

  @Get('buscar-por-id/:id')
  @ApiOperation({ summary: 'Busca um agendamento por id' })
  @ApiResponse({ status: 200, description: 'Agendamento encontrado com sucesso' })
  buscarPorId(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'GET', `/agendamento/buscar-por-id/${id}`);
  }

  @Put('atualizar')
  @ApiOperation({ summary: 'Atualiza um agendamento' })
  @ApiResponse({ status: 204, description: 'Agendamento atualizado com sucesso' })
  atualizar(@Body() body: unknown, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'PUT', '/agendamento/atualizar', body);
  }

  @Delete('excluir/:id')
  @ApiOperation({ summary: 'Exclui um agendamento' })
  @ApiResponse({ status: 204, description: 'Agendamento excluido com sucesso' })
  excluir(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'DELETE', `/agendamento/excluir/${id}`);
  }
}
