import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Res } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProxyService } from '@services/proxy/proxy.service';
import { Request, Response } from 'express';

@ApiTags('Equipamento')
@ApiCookieAuth()
@Controller('equipamento')
export class EquipamentoController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post('cadastrar')
  @ApiOperation({ summary: 'Cadastra um equipamento' })
  @ApiResponse({ status: 201, description: 'Equipamento cadastrado com sucesso' })
  cadastrar(@Body() body: unknown, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'POST', '/equipamento/cadastrar', body);
  }

  @Get('listar')
  @ApiOperation({ summary: 'Lista equipamentos paginados' })
  @ApiQuery({ name: 'page', required: true, type: Number })
  @ApiQuery({ name: 'limit', required: true, type: Number })
  @ApiQuery({ name: 'id_empresa', required: true, type: Number })
  @ApiResponse({ status: 200, description: 'Equipamentos listados com sucesso' })
  listar(
    @Query('page') _page: string,
    @Query('limit') _limit: string,
    @Query('id_empresa') _idEmpresa: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    return this.proxyService.forward(req, res, 'GET', '/equipamento/listar');
  }

  @Get('buscar-por-id/:id')
  @ApiOperation({ summary: 'Busca um equipamento por id' })
  @ApiResponse({ status: 200, description: 'Equipamento encontrado com sucesso' })
  buscarPorId(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'GET', `/equipamento/buscar-por-id/${id}`);
  }

  @Put('atualizar')
  @ApiOperation({ summary: 'Atualiza um equipamento' })
  @ApiResponse({ status: 204, description: 'Equipamento atualizado com sucesso' })
  atualizar(@Body() body: unknown, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'PUT', '/equipamento/atualizar', body);
  }

  @Delete('excluir/:id')
  @ApiOperation({ summary: 'Exclui um equipamento' })
  @ApiResponse({ status: 204, description: 'Equipamento excluido com sucesso' })
  excluir(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'DELETE', `/equipamento/excluir/${id}`);
  }
}
