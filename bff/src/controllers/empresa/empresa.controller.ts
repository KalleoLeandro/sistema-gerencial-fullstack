import { Body, Controller, Delete, Get, Param, Post, Put, Req, Res } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProxyService } from '@services/proxy/proxy.service';
import { Request, Response } from 'express';

@ApiTags('Empresa')
@ApiCookieAuth()
@Controller('empresa')
export class EmpresaController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post('cadastrar')
  @ApiOperation({ summary: 'Cadastra uma empresa' })
  @ApiResponse({ status: 201, description: 'Empresa cadastrada com sucesso' })
  cadastrar(@Body() body: unknown, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'POST', '/empresa/cadastrar', body);
  }

  @Get('listar')
  @ApiOperation({ summary: 'Lista empresas paginadas' })
  @ApiResponse({ status: 200, description: 'Empresas listadas com sucesso' })
  listar(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'GET', '/empresa/listar');
  }

  @Get('listar-por-nome')
  @ApiOperation({ summary: 'Lista empresas filtradas por nome' })
  @ApiResponse({ status: 200, description: 'Empresas listadas com sucesso' })
  listarPorNome(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'GET', '/empresa/listar-por-nome');
  }

  @Get('buscar-por-id/:id')
  @ApiOperation({ summary: 'Busca uma empresa por id' })
  @ApiResponse({ status: 200, description: 'Empresa encontrada com sucesso' })
  buscarPorId(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'GET', `/empresa/buscar-por-id/${id}`);
  }

  @Put('atualizar')
  @ApiOperation({ summary: 'Atualiza uma empresa' })
  @ApiResponse({ status: 204, description: 'Empresa atualizada com sucesso' })
  atualizar(@Body() body: unknown, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'PUT', '/empresa/atualizar', body);
  }

  @Delete('excluir/:id')
  @ApiOperation({ summary: 'Exclui uma empresa' })
  @ApiResponse({ status: 204, description: 'Empresa excluida com sucesso' })
  excluir(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'DELETE', `/empresa/excluir/${id}`);
  }

  @Post('salvar-infra/:id')
  @ApiOperation({ summary: 'Salva a infraestrutura de uma empresa' })
  @ApiResponse({ status: 204, description: 'Infraestrutura salva com sucesso' })
  salvarInfra(@Body() body: unknown, @Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'POST', `/empresa/salvar-infra/${id}`, body);
  }
}
