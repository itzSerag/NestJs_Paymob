import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaymentModule } from './payment/payment.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './common/database/database.module';
import { ConfigModule } from './common/config/config.module';
import { MailModule } from './mail/mail.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/guards/role.guard';
import { JwtAuthGuard } from './auth/guards/jwt.guard';
import { VerifiedGuard } from './auth/guards/verifed-user.guard';

@Module({
  imports: [
    PaymentModule,
    AuthModule,
    UserModule,
    DatabaseModule,
    ConfigModule,
    MailModule,

  ],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // First, ensure user is authenticated
    },
    {
      // this guard will be applied to all routes // but not the public routes
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      // this guard will be applied to all routes // but not the public routes
      provide: APP_GUARD,
      useClass: VerifiedGuard,
    },
  ]
})
export class AppModule { }
