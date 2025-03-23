import { Module } from '@nestjs/common';
import { ConfigModule } from 'src/common';
import { DatabaseModule } from 'src/common/database/database.module';
import { OtpModel, OtpSchema } from './models/otp.schema';
import { OtpRepo } from './repository/otp.repo';
import { MailService } from './mail.service';

@Module({
  imports: [ConfigModule, DatabaseModule, DatabaseModule.forFeature([{
    name: OtpModel.name, schema: OtpSchema
  }]),],
  providers: [MailService, OtpRepo],
  exports: [MailService, OtpRepo],
})
export class MailModule { }
