import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  // Configuracion de CORS para permitir solicitudes desde el frontend
  app.enableCors({
    origin: ['http://localhost:5173'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });



 // Configuracion del swagger
  const config = new DocumentBuilder()
  .setTitle("XILEF")
  .setDescription("API XILEF")
  .setVersion("1.0")
  .addBearerAuth()
  .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs",app, document);

  await app.listen(process.env.PORT ?? 3000);

  

}
bootstrap();
