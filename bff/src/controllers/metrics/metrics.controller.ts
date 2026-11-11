import { Controller, Get, Res } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { Response } from 'express';
import * as client from 'prom-client';

@Controller('metrics')
export class MetricsController {
  private readonly register: client.Registry;

  constructor() {
    this.register = new client.Registry();
    this.register.setDefaultLabels({ app: 'bff' });
    client.collectDefaultMetrics({ register: this.register });
  }

  @Get()
  @ApiExcludeEndpoint()
  async getMetrics(@Res() res: Response) {
    res.setHeader('Content-Type', this.register.contentType);
    res.end(await this.register.metrics());
  }
}
