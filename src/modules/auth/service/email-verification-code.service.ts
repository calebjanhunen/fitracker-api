import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { EmailVerificationCodeAlreadyUsedException } from '../internal-exceptions/email-verification-code-alread-used.exception';
import { EmailVerificationCodeExpiredException } from '../internal-exceptions/email-verification-expired.exception';
import { EmailVerificationCodeModel } from '../models/email-verification-code.model';
import { EmailVerificationCodeRepository } from '../repository/email-verification-code.repository';

@Injectable()
export class EmailVerificationCodeService {
  private EMAIL_VERIFICATION_CODE_LENGTH = 6;
  private EMAIL_VERIFICATION_CODE_EXPIRES_AT_OFFEST = 1;
  constructor(
    private readonly emailVerificationCodeRepo: EmailVerificationCodeRepository,
  ) {}

  public async saveEmailVerificationCode(email: string): Promise<string> {
    const signupCode = this.generateEmailVerificationCode();
    const expiresAt = new Date();
    expiresAt.setHours(
      expiresAt.getHours() + this.EMAIL_VERIFICATION_CODE_EXPIRES_AT_OFFEST,
    );

    await this.emailVerificationCodeRepo.upsertEmailVerificationCode(
      email,
      signupCode,
      expiresAt,
    );

    return signupCode;
  }

  public async getEmailVerificationCodeByEmail(
    email: string,
  ): Promise<EmailVerificationCodeModel | null> {
    return this.emailVerificationCodeRepo.getEmailVerificationCodeByEmail(
      email,
    );
  }

  public async getEmailVerificationCodeByCodeAndEmail(
    code: string,
    email: string,
  ): Promise<EmailVerificationCodeModel | null> {
    return this.emailVerificationCodeRepo.getEmailVerificationCode(code, email);
  }

  public async confirmEmailVerificationCodeIsValidAndSetAsUsed(
    code: string,
    email: string,
  ): Promise<void> {
    const signupCodeModel = await this.getEmailVerificationCodeByCodeAndEmail(
      code,
      email,
    );
    if (!signupCodeModel) {
      throw new ResourceNotFoundException('Code not found');
    }

    const now = new Date();
    if (now > signupCodeModel.expiresAt) {
      throw new EmailVerificationCodeExpiredException();
    }

    if (signupCodeModel.usedAt) {
      throw new EmailVerificationCodeAlreadyUsedException();
    }

    await this.emailVerificationCodeRepo.setEmailVerificationCodeAsUsed(
      signupCodeModel.id,
    );
  }

  private generateEmailVerificationCode(): string {
    return crypto
      .randomBytes(this.EMAIL_VERIFICATION_CODE_LENGTH)
      .toString('hex')
      .slice(0, this.EMAIL_VERIFICATION_CODE_LENGTH)
      .toUpperCase();
  }
}
