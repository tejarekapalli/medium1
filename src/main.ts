import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import * as passport from 'passport';
import { ExpressAdapter } from '@nestjs/platform-express';
import { Server } from 'http';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use(passport.initialize())
  app.enableCors()
  app.setGlobalPrefix('/')
  app.use('/static', express.static('public'))
  app.useGlobalPipes(new ValidationPipe())
  await app.listen(3300);
}
bootstrap();
