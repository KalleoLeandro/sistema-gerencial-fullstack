import { Controller, Get, Req, Res } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProxyService } from '@services/proxy/proxy.service';
import { Request, Response } from 'express';

@ApiTags('Dashboard')
@ApiCookieAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get('retornar-lucro-mes')
  @ApiOperation({ summary: 'Retorna o lucro do mes' })
  @ApiResponse({ status: 200, description: 'Indicador retornado com sucesso' })
  retornarLucroMes(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'GET', '/dashboard/retornar-lucro-mes');
  }

  @Get('retornar-lucro-ano')
  @ApiOperation({ summary: 'Retorna o lucro do ano' })
  @ApiResponse({ status: 200, description: 'Indicador retornado com sucesso' })
  retornarLucroAno(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'GET', '/dashboard/retornar-lucro-ano');
  }

  @Get('retornar-contratos-acabando')
  @ApiOperation({ summary: 'Retorna contratos proximos do encerramento' })
  @ApiResponse({ status: 200, description: 'Indicador retornado com sucesso' })
  retornarContratosAcabando(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'GET', '/dashboard/retornar-contratos-acabando');
  }

  @Get('retornar-chamados-cancelados')
  @ApiOperation({ summary: 'Retorna a quantidade de chamados cancelados' })
  @ApiResponse({ status: 200, description: 'Indicador retornado com sucesso' })
  retornarChamadosCancelados(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'GET', '/dashboard/retornar-chamados-cancelados');
  }

  @Get('retornar-total-chamados-mes')
  @ApiOperation({ summary: 'Retorna o total de chamados do mes' })
  @ApiResponse({ status: 200, description: 'Indicador retornado com sucesso' })
  retornarTotalChamadosMes(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'GET', '/dashboard/retornar-total-chamados-mes');
  }

  @Get('retornar-chamados-atrasados')
  @ApiOperation({ summary: 'Retorna a quantidade de chamados atrasados' })
  @ApiResponse({ status: 200, description: 'Indicador retornado com sucesso' })
  retornarChamadosAtrasados(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'GET', '/dashboard/retornar-chamados-atrasados');
  }

  @Get('retornar-chamados-atendidos-por-mim')
  @ApiOperation({ summary: 'Retorna a quantidade de chamados atendidos pelo usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Indicador retornado com sucesso' })
  retornarChamadosAtendidosPorMim(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'GET', '/dashboard/retornar-chamados-atendidos-por-mim');
  }

  @Get('retornar-por-mes')
  @ApiOperation({ summary: 'Retorna a serie mensal de lucros' })
  @ApiResponse({ status: 200, description: 'Serie retornada com sucesso' })
  retornarPorMes(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'GET', '/dashboard/retornar-por-mes');
  }

  @Get('retornar-produtos-em-falta')
  @ApiOperation({ summary: 'Retorna a quantidade de produtos em falta' })
  @ApiResponse({ status: 200, description: 'Indicador retornado com sucesso' })
  retornarProdutosEmFalta(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'GET', '/dashboard/retornar-produtos-em-falta');
  }

  @Get('retornar-vendas-por-mes')
  @ApiOperation({ summary: 'Retorna a serie mensal de vendas' })
  @ApiResponse({ status: 200, description: 'Serie retornada com sucesso' })
  retornarVendasPorMes(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'GET', '/dashboard/retornar-vendas-por-mes');
  }

  @Get('retornar-proporcao-atendimento')
  @ApiOperation({ summary: 'Retorna a proporcao de atendimentos por tipo' })
  @ApiResponse({ status: 200, description: 'Serie retornada com sucesso' })
  retornarProporcaoAtendimento(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'GET', '/dashboard/retornar-proporcao-atendimento');
  }

  @Get('retornar-contratos-calendario')
  @ApiOperation({ summary: 'Retorna os contratos do calendario' })
  @ApiResponse({ status: 200, description: 'Eventos retornados com sucesso' })
  retornarContratosCalendario(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'GET', '/dashboard/retornar-contratos-calendario');
  }

  @Get('retornar-agenda-eventos')
  @ApiOperation({ summary: 'Retorna os eventos da agenda' })
  @ApiResponse({ status: 200, description: 'Eventos retornados com sucesso' })
  retornarAgendaEventos(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'GET', '/dashboard/retornar-agenda-eventos');
  }
}
