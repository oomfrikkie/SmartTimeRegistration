import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ImportModule } from './import/import.module';
import { EventModule } from './event/event.module';
import { AccountModule } from './account/account.module';
import { ProjectModule } from './project/project.module';
import { AccountTokenModule } from './account/token/account-token.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

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
        synchronize: false,
        logging: ['query', 'error', 'warn'],
      }),
    }),

    ImportModule,
    EventModule,
    AccountModule,
    ProjectModule,
    AccountTokenModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}