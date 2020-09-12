import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  const options = new DocumentBuilder()
    .setTitle('Swagger')
    .setDescription('API Documentation')
    .setVersion('0.2')
    .setContact('Nobrainer Labs', 'https://github.com/nobrainerlabs/mvp-starterkit-api', 'nobrainerlabs@gmail.com')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(process.env.PORT);

  console.log(`app listening on: http://${process.env.HOST}`)
}
bootstrap();
