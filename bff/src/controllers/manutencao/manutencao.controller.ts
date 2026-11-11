import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Res } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProxyService } from '@services/proxy/proxy.service';
import { Request, Response } from 'express';

@ApiTags('Manutencao')
@ApiCookieAuth()
@Controller('manutencao')
export class ManutencaoController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post('cadastrar')
  @ApiOperation({ summary: 'Cadastra uma manutencao' })
  @ApiResponse({ status: 201, description: 'Manutencao cadastrada com sucesso' })
  cadastrar(@Body() body: unknown, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'POST', '/manutencao/cadastrar', body);
  }

  @Get('listar')
  @ApiOperation({ summary: 'Lista manutencoes paginadas' })
  @ApiQuery({ name: 'page', required: true, type: Number })
  @ApiQuery({ name: 'limit', required: true, type: Number })
  @ApiQuery({ name: 'id', required: true, type: Number })
  @ApiResponse({ status: 200, description: 'Manutencoes listadas com sucesso' })
  listar(
    @Query('page') _page: string,
    @Query('limit') _limit: string,
    @Query('id') _id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    return this.proxyService.forward(req, res, 'GET', '/manutencao/listar');
  }

  @Get('buscar-por-id/:id')
  @ApiOperation({ summary: 'Busca uma manutencao por id' })
  @ApiResponse({ status: 200, description: 'Manutencao encontrada com sucesso' })
  buscarPorId(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'GET', `/manutencao/buscar-por-id/${id}`);
  }

  @Put('atualizar')
  @ApiOperation({ summary: 'Atualiza uma manutencao' })
  @ApiResponse({ status: 204, description: 'Manutencao atualizada com sucesso' })
  atualizar(@Body() body: unknown, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'PUT', '/manutencao/atualizar', body);
  }

  @Put('alterar-status')
  @ApiOperation({ summary: 'Altera o status de uma manutencao' })
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
    return this.proxyService.forward(req, res, 'PUT', '/manutencao/alterar-status', body);
  }

  @Delete('excluir/:id')
  @ApiOperation({ summary: 'Exclui uma manutencao' })
  @ApiResponse({ status: 204, description: 'Manutencao excluida com sucesso' })
  excluir(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'DELETE', `/manutencao/excluir/${id}`);
  }
}
