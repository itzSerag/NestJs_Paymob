import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [UserModule, JwtModule.registerAsync({
    imports: [ConfigModule],
    useFactory: async (configService) => ({
      secret: configService.get('JWT_ACCESS_SECRET'),
      signOptions: { expiresIn: configService.get('JWT_ACCESS_EXP') },
    }),
    inject: [ConfigService],
  })],
  controllers: [AuthController],
  providers: [AuthService, JwtService],
})
export class AuthModule { }
