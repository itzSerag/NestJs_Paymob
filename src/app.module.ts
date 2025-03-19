import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaymentModule } from './payment/payment.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './common/database/database.module';
import { ConfigModule } from './common/config/config.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    PaymentModule,
    UserModule,
    AuthModule,
    DatabaseModule,
    ConfigModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
