import type { Response } from 'express';
import { Test, TestingModule } from '@nestjs/testing';
import { MetricsController } from './metrics.controller';

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
