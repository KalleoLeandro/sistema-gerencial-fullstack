import { Body, Controller, Delete, Get, Param, Post, Put, Req, Res } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProxyService } from '@services/proxy/proxy.service';
import { Request, Response } from 'express';

@ApiTags('Login')
@Controller('login')
export class LoginController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post('validar-login')
  @ApiOperation({ summary: 'Autentica o usuario e inicia a sessao' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  validarLogin(@Body() body: unknown, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'POST', '/login/validar-login', body);
  }

  @Post('refresh')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Renova a sessao atual via refresh token' })
  @ApiResponse({ status: 200, description: 'Sessao renovada com sucesso' })
  refresh(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'POST', '/login/refresh');
  }

  @Post('logout')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Encerra a sessao atual' })
  @ApiResponse({ status: 204, description: 'Logout realizado com sucesso' })
  logout(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'POST', '/login/logout');
  }

  @Post('validar-token')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Valida o token de acesso atual' })
  @ApiResponse({ status: 200, description: 'Token validado com sucesso' })
  validarToken(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'POST', '/login/validar-token');
  }

  @Get('buscar-por-token')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Retorna o usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Usuario retornado com sucesso' })
  buscarPorToken(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'GET', '/login/buscar-por-token');
  }

  @Post('cadastrar')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Cadastra um usuario' })
  @ApiResponse({ status: 201, description: 'Usuario cadastrado com sucesso' })
  cadastrar(@Body() body: unknown, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'POST', '/login/cadastrar', body);
  }

  @Get('listar')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Lista usuarios paginados' })
  @ApiResponse({ status: 200, description: 'Usuarios listados com sucesso' })
  listar(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'GET', '/login/listar');
  }

  @Get('listar-todos')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Lista todos os usuarios executores' })
  @ApiResponse({ status: 200, description: 'Usuarios listados com sucesso' })
  listarTodos(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'GET', '/login/listar-todos');
  }

  @Get('buscar-por-id/:id')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Busca um usuario por id' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado com sucesso' })
  buscarPorId(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'GET', `/login/buscar-por-id/${id}`);
  }

  @Get('buscar-por-nome')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Busca usuarios por nome' })
  @ApiResponse({ status: 200, description: 'Usuarios encontrados com sucesso' })
  buscarPorNome(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'GET', '/login/buscar-por-nome');
  }

  @Put('atualizar')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Atualiza um usuario' })
  @ApiResponse({ status: 204, description: 'Usuario atualizado com sucesso' })
  atualizar(@Body() body: unknown, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'PUT', '/login/atualizar', body);
  }

  @Delete('excluir/:id')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Exclui um usuario por id' })
  @ApiResponse({ status: 204, description: 'Usuario excluido com sucesso' })
  excluir(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'DELETE', `/login/excluir/${id}`);
  }

  @Get('retorna-perfil')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Retorna o perfil do usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil retornado com sucesso' })
  retornarPerfil(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'GET', '/login/retorna-perfil');
  }
}
