import type { Response } from 'express';
import type { Server } from 'node:http';
import type { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { MetricsController } from './metrics.controller';
import { AppModule } from '../../app.module';

describe('MetricsController', () => {
  let controller: MetricsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricsController],
    }).compile();

    controller = module.get<MetricsController>(MetricsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('returns Prometheus metrics with the correct content type and application label', async () => {
    const response = { setHeader: jest.fn(), end: jest.fn() };
    await controller.getMetrics(response as unknown as Response);
    expect(response.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      expect.stringContaining('text/plain'),
    );
    expect(response.end).toHaveBeenCalledWith(
      expect.stringContaining('app="bff"'),
    );
  });
});

describe('MetricsController registered in AppModule', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('exposes GET /metrics without authentication in Prometheus format', async () => {
    const response = await request(app.getHttpServer() as Server)
      .get('/metrics')
      .expect(200)
      .expect('Content-Type', /text\/plain/);

    expect(response.text).toContain('app="bff"');
    expect(response.text).toContain('# HELP');
    expect(response.text).toContain('# TYPE');
  });
});
