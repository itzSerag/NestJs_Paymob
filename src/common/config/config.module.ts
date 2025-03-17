import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
    imports: [NestConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env',
        validationSchema: Joi.object({
            NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
            PORT: Joi.number().default(5000),
            DATABASE_URI: Joi.string().required(),
        })
    }),
    ],
})
export class ConfigModule { }
