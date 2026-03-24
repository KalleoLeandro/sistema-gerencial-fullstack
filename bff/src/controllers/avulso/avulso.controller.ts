import { Body, Controller, Delete, Get, Param, Post, Put, Req, Res } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProxyService } from '@services/proxy/proxy.service';
import { Request, Response } from 'express';

@ApiTags('Avulso')
@ApiCookieAuth()
@Controller('avulso')
export class AvulsoController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post('cadastrar')
  @ApiOperation({ summary: 'Cadastra um chamado avulso' })
  @ApiResponse({ status: 201, description: 'Chamado avulso cadastrado com sucesso' })
  cadastrar(@Body() body: unknown, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'POST', '/avulso/cadastrar', body);
  }

  @Get('listar')
  @ApiOperation({ summary: 'Lista chamados avulsos paginados' })
  @ApiResponse({ status: 200, description: 'Chamados avulsos listados com sucesso' })
  listar(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'GET', '/avulso/listar');
  }

  @Get('listar-com-pesquisa')
  @ApiOperation({ summary: 'Lista chamados avulsos com pesquisa' })
  @ApiResponse({ status: 200, description: 'Chamados avulsos listados com sucesso' })
  listarComPesquisa(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'GET', '/avulso/listar-com-pesquisa');
  }

  @Get('buscar-por-id/:id')
  @ApiOperation({ summary: 'Busca um chamado avulso por id' })
  @ApiResponse({ status: 200, description: 'Chamado avulso encontrado com sucesso' })
  buscarPorId(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'GET', `/avulso/buscar-por-id/${id}`);
  }

  @Put('atualizar')
  @ApiOperation({ summary: 'Atualiza um chamado avulso' })
  @ApiResponse({ status: 204, description: 'Chamado avulso atualizado com sucesso' })
  atualizar(@Body() body: unknown, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'PUT', '/avulso/atualizar', body);
  }

  @Put('alterar-status')
  @ApiOperation({ summary: 'Altera o status de um chamado avulso' })
  @ApiResponse({ status: 204, description: 'Status alterado com sucesso' })
  alterarStatus(@Body() body: unknown, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'PUT', '/avulso/alterar-status', body);
  }

  @Delete('excluir/:id')
  @ApiOperation({ summary: 'Exclui um chamado avulso' })
  @ApiResponse({ status: 204, description: 'Chamado avulso excluido com sucesso' })
  excluir(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'DELETE', `/avulso/excluir/${id}`);
  }
}
