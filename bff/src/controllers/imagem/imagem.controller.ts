import { Controller, Delete, Get, Param, Post, Query, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiConsumes, ApiCookieAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProxyService } from '@services/proxy/proxy.service';
import { Request, Response } from 'express';

type UploadedImageFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
};

@ApiTags('Imagens')
@ApiCookieAuth()
@Controller('imagens')
export class ImagemController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('arquivo'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Faz upload de uma imagem' })
  @ApiResponse({ status: 201, description: 'Imagem enviada com sucesso' })
  upload(
    @UploadedFile() arquivo: UploadedImageFile,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const body = req.body as Record<string, string | undefined>;
    return this.proxyService.forwardMultipart(req, res, '/imagens/upload', body, arquivo);
  }

  @Get('listar')
  @ApiOperation({ summary: 'Lista imagens por entidade' })
  @ApiQuery({ name: 'entityType', required: true, type: String })
  @ApiQuery({ name: 'entityId', required: true, type: Number })
  @ApiQuery({ name: 'categoria', required: false, type: String })
  listar(
    @Query('entityType') _entityType: string,
    @Query('entityId') _entityId: string,
    @Query('categoria') _categoria: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.proxyService.forward(req, res, 'GET', '/imagens/listar');
  }

  @Get(':id/conteudo')
  @ApiOperation({ summary: 'Retorna o conteudo binario da imagem' })
  conteudo(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'GET', `/imagens/${id}/conteudo`);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Exclui uma imagem' })
  @ApiResponse({ status: 204, description: 'Imagem excluida com sucesso' })
  excluir(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.forward(req, res, 'DELETE', `/imagens/${id}`);
  }
}
