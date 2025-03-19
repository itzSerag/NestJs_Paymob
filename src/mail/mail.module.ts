import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigModule } from 'src/common';

@Module({
  imports: [ConfigModule],
  providers: [MailService]
})
export class MailModule { }
