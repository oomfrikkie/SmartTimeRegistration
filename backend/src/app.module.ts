import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
     
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('POSTGRES_HOST') || 'postgres',
        port: parseInt(config.get<string>('POSTGRES_PORT') || '5432', 10),
        username: config.get<string>('POSTGRES_USER') || 'admin',
        password: config.get<string>('POSTGRES_PASSWORD') || 'admin',
        database: config.get<string>('POSTGRES_DB') || 'mydb',
        autoLoadEntities: true,
        synchronize: true, // dev only
      }),
    }),
  ],
})
export class AppModule {}
