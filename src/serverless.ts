import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import serverlessExpress from '@vendia/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';

let server: Handler;

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();

  const configBuilder = new DocumentBuilder()
    .setTitle('Football Reservations API')
    .setDescription('API for managing football field reservations with multi-tenancy')
    .setVersion('1.0')
    .addBearerAuth();

  // Solo añadimos el prefijo de AWS si NO estamos en local (serverless offline)
  if (!process.env.IS_OFFLINE) {
    configBuilder.addServer(`/${process.env.STAGE || 'dev'}`);
  }

  const config = configBuilder.build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};
