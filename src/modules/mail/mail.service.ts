import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from 'src/common/logger/logger.service';
import { MailFailedToSendException } from './internal-exceptions/mail-failed-to-send.exception';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(MailService.name);
  }

  public async sendVerificationEmail(
    emailAddress: string,
    code: string,
  ): Promise<void> {
    try {
      if (this.configService.get('SEND_EMAILS')) {
        const result = await this.mailerService.sendMail({
          to: emailAddress,
          subject: 'Verify your Email',
          template: './signup-code',
          context: {
            code,
          },
        });
        this.logger.log(`Signup email successfully sent: ${result.response}`);
      } else {
        this.logger.log('Sending emails is not configured');
      }
    } catch (e) {
      this.logger.error(e, 'Signup Code email failed to send.');
      throw new MailFailedToSendException(e);
    }
  }

  public async sendForgotPasswordEmail(emailAddress: string, token: string) {
    try {
      if (this.configService.get('SEND_EMAILS')) {
        const result = await this.mailerService.sendMail({
          to: emailAddress,
          subject: 'Reset Password',
          template: './reset-password',
          context: {
            resetLink: `${this.configService.getOrThrow(
              'FITRACKER_WEBSITE_URL',
            )}?token=${token}`,
          },
        });
        this.logger.log(
          `Reset password email successfully sent: ${result.response}`,
        );
      } else {
        this.logger.log('Sending emails is not configured');
      }
    } catch (e) {
      this.logger.error(e, 'Reset password email failed to send.');
      throw new MailFailedToSendException(e);
    }
  }
}
