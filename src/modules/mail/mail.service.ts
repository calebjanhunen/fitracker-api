import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerServiceV2 } from 'src/common/logger/logger-v2.service';
import { MailFailedToSendException } from './internal-exceptions/mail-failed-to-send.exception';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly logger: LoggerServiceV2,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(MailService.name);
  }

  public async sendVerificationEmail(
    emailAddress: string,
    code: string,
  ): Promise<void> {
    try {
      const result = await this.mailerService.sendMail({
        to: emailAddress,
        subject: 'Verify your Email',
        template: './signup-code',
        context: {
          code,
        },
      });
      this.logger.log(`Signup email successfully sent: ${result.response}`);
    } catch (e) {
      this.logger.error('Signup Code email failed to send: ', e);
      throw new MailFailedToSendException(e);
    }
  }
}
