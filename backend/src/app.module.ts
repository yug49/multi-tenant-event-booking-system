import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SeedService } from './database/seed.service';
import { OrganizationsModule } from './modules/organizations';
import { UsersModule } from './modules/users';
import { ResourcesModule } from './modules/resources';
import { EventsModule } from './modules/events';
import { RegistrationsModule } from './modules/registrations';
import { AllocationsModule } from './modules/allocations';
import { ReportsModule } from './modules/reports';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'event_booking'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        logging: true,
        // Railway PostgreSQL requires SSL
        ssl: configService.get('NODE_ENV') === 'production' 
          ? { rejectUnauthorized: false } 
          : false,
      }),
      inject: [ConfigService],
    }),
    OrganizationsModule,
    UsersModule,
    ResourcesModule,
    EventsModule,
    RegistrationsModule,
    AllocationsModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeedService],
})
export class AppModule {}
