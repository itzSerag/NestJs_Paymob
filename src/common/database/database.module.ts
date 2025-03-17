import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '@nestjs/config';

@Module({

    imports: [MongooseModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: async (configService) => ({
            uri: configService.get('DATABASE_URI'),
        }), inject: [ConfigService],
    })
    ],
})
export class DatabaseModule { }
