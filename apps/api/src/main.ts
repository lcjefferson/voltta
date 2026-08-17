import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });
  // Logo em data URL precisa de body maior que o default (~100kb).
  app.useBodyParser('json', { limit: '2mb' });
  app.useBodyParser('urlencoded', { limit: '2mb', extended: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({
    origin: process.env.WEB_URL?.split(',') || true,
    credentials: true,
  });
  app.setGlobalPrefix('v1', { exclude: ['/', 'health', 'ready'] });
  const swagger = new DocumentBuilder()
    .setTitle('VOLTTA API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup(
    'docs',
    app,
    SwaggerModule.createDocument(app, swagger),
  );
  const port = Number(process.env.API_PORT || process.env.PORT || 3001);
  await app.listen(port, '0.0.0.0');
  console.log(`VOLTTA API listening on http://0.0.0.0:${port}`);
  console.log(`Swagger docs at http://0.0.0.0:${port}/docs`);
}
bootstrap();
