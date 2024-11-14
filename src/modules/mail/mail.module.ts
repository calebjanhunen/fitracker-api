import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerServiceV2 } from 'src/common/logger/logger-v2.service';
import { mailConfig } from './config/mail.config';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: mailConfig,
      inject: [ConfigService],
    }),
  ],
  providers: [MailService, LoggerServiceV2],
  exports: [MailService],
})
export class MailModule {}
