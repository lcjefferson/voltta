import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: process.env.WEB_URL?.split(',') || true, credentials: true });
  app.setGlobalPrefix('v1', { exclude: ['/', 'health', 'ready'] });
  const swagger = new DocumentBuilder().setTitle('VOLTTA API').setVersion('1.0').addBearerAuth().build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swagger));
  const port = Number(process.env.API_PORT || process.env.PORT || 3001);
  await app.listen(port);
  console.log(`VOLTTA API listening on http://localhost:${port}`);
  console.log(`Swagger docs at http://localhost:${port}/docs`);
}
bootstrap();
