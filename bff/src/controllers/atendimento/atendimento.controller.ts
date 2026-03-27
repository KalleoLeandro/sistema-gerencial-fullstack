import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Res } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProxyService } from '@services/proxy/proxy.service';
import { Request, Response } from 'express';

@ApiTags('Atendimento')
@ApiCookieAuth()
@Controller('atendimento')
export class AtendimentoController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post('cadastrar')
  @ApiOperation({ summary: 'Cadastra um atendimento' })
  @ApiResponse({ status: 201, description: 'Atendimento cadastrado com sucesso' })
  cadastrar(@Body() body: unknown, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'POST', '/atendimento/cadastrar', body);
  }

  @Get('listar')
  @ApiOperation({ summary: 'Lista atendimentos paginados' })
  @ApiQuery({ name: 'page', required: true, type: Number })
  @ApiQuery({ name: 'limit', required: true, type: Number })
  @ApiQuery({ name: 'id', required: true, type: Number })
  @ApiResponse({ status: 200, description: 'Atendimentos listados com sucesso' })
  listar(
    @Query('page') _page: string,
    @Query('limit') _limit: string,
    @Query('id') _id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    return this.proxyService.forward(req, res, 'GET', '/atendimento/listar');
  }

  @Get('buscar-por-id/:id')
  @ApiOperation({ summary: 'Busca um atendimento por id' })
  @ApiResponse({ status: 200, description: 'Atendimento encontrado com sucesso' })
  buscarPorId(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'GET', `/atendimento/buscar-por-id/${id}`);
  }

  @Put('atualizar')
  @ApiOperation({ summary: 'Atualiza um atendimento' })
  @ApiResponse({ status: 204, description: 'Atendimento atualizado com sucesso' })
  atualizar(@Body() body: unknown, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'PUT', '/atendimento/atualizar', body);
  }

  @Put('alterar-status')
  @ApiOperation({ summary: 'Altera o status de um atendimento' })
  @ApiQuery({ name: 'id', required: true, type: Number })
  @ApiQuery({ name: 'status', required: true, type: Number })
  @ApiResponse({ status: 204, description: 'Status alterado com sucesso' })
  alterarStatus(
    @Body() body: unknown,
    @Query('id') _id: string,
    @Query('status') _status: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    return this.proxyService.forward(req, res, 'PUT', '/atendimento/alterar-status', body);
  }

  @Delete('excluir/:id')
  @ApiOperation({ summary: 'Exclui um atendimento' })
  @ApiResponse({ status: 204, description: 'Atendimento excluido com sucesso' })
  excluir(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'DELETE', `/atendimento/excluir/${id}`);
  }
}
