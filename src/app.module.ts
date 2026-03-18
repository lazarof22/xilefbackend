import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClienteModule } from './modules/cliente/cliente.module';
import { ProductoModule } from './modules/producto/producto.module';
import { AuthModule } from './modules/auth/auth.module';
import { MonedaModule } from './modules/moneda/moneda.module';

@Module({
  imports: [

    //Configuracion de la Base de datos
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
      //Iniciacion de los modulos
    AuthModule,
    ClienteModule,
    MonedaModule,
    ProductoModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
