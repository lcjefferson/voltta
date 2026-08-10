import { Controller, Get, Module } from '@nestjs/common';
import { Public } from '../../common/decorators/auth.decorators';

@Public()
@Controller()
class HealthController {
  @Get()
  root() {
    return {
      name: 'VOLTTA API',
      slogan: 'Seu cliente sempre de volta.',
      status: 'ok',
      docs: '/docs',
      health: '/health',
      api: '/v1',
      web: process.env.WEB_URL || 'http://localhost:3000',
    };
  }

  @Get('health')
  health() {
    return { status: 'ok' };
  }

  @Get('ready')
  ready() {
    return { status: 'ready' };
  }
}

@Module({ controllers: [HealthController] })
export class HealthModule {}
