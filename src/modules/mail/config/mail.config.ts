import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

export async function mailConfig(
  configService: ConfigService,
): Promise<MailerOptions> {
  return {
    transport: {
      host: configService.getOrThrow('SMTP_SERVER'),
      port: configService.getOrThrow('SMTP_PORT'),
      auth: {
        user: configService.getOrThrow('SMTP_USER'),
        pass: configService.getOrThrow('SMTP_PASSWORD'),
      },
    },
    defaults: {
      from: `"No Reply" <${configService.getOrThrow('SMTP_EMAIL')}>`,
      replyTo: configService.getOrThrow('SMTP_EMAIL'),
    },
    template: {
      dir: join(__dirname, '../templates'),
      adapter: new HandlebarsAdapter(),
      options: {
        strict: true,
      },
    },
  };
}
