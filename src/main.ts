import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from "dotenv";
import { HttpExceptionFilter } from './common/filters/http-exception-filter';
import { Logger, ValidationPipe } from '@nestjs/common';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  /**
   * Enable CORS Configuration
   */
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const allowedMethods = process.env.ALLOW_METHODS;
  const useCredentials = process.env.CREDENTIALS === 'true';

  app.enableCors({
    origin: clientUrl,
    methods: allowedMethods,
    credentials: useCredentials
  });

  app.set('query parser', 'extended');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('User API')
    .setDescription('API for managing users')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Enter JWT token",
        in: "header"
      },
      "jwt-auth"
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 4001);

  Logger.log(`Application is running on: http://localhost:${process.env.PORT ?? 4001}`);
  Logger.log(`Swagger UI is available on: http://localhost:${process.env.PORT ?? 4001}/api`);
}
bootstrap();
