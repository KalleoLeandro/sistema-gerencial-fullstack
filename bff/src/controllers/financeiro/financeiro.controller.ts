import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { ProxyService } from '@services/proxy/proxy.service';
import { Request, Response } from 'express';

@ApiTags('Financeiro')
@ApiCookieAuth()
@Controller('financeiro')
export class FinanceiroController {
  constructor(private readonly proxy: ProxyService) {}
  @Get('contas') listar(@Req() req: Request, @Res() res: Response) {
    return this.proxy.forward(req, res, 'GET', '/financeiro/contas');
  }
  @Get('relatorios') relatorios(@Req() req: Request, @Res() res: Response) {
    return this.proxy.forward(req, res, 'GET', '/financeiro/relatorios');
  }
  @Get('contas/:origem/:id') detalhes(
    @Param('origem') origem: string,
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.proxy.forward(
      req,
      res,
      'GET',
      `/financeiro/contas/${encodeURIComponent(origem)}/${encodeURIComponent(id)}`,
    );
  }
  @Post('contas') criar(
    @Body() body: unknown,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.proxy.forward(req, res, 'POST', '/financeiro/contas', body);
  }
  @Put('contas/:id') atualizar(
    @Param('id') id: string,
    @Body() body: unknown,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.proxy.forward(
      req,
      res,
      'PUT',
      `/financeiro/contas/${encodeURIComponent(id)}`,
      body,
    );
  }
  @Post('contas/:id/cancelar') cancelar(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.proxy.forward(
      req,
      res,
      'POST',
      `/financeiro/contas/${encodeURIComponent(id)}/cancelar`,
      {},
    );
  }
  @Post('contas/:origem/:id/baixas') baixar(
    @Param('origem') origem: string,
    @Param('id') id: string,
    @Body() body: unknown,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.proxy.forward(
      req,
      res,
      'POST',
      `/financeiro/contas/${encodeURIComponent(origem)}/${encodeURIComponent(id)}/baixas`,
      body,
    );
  }
}
