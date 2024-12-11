import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DbModule } from 'src/common/database/database.module';
import { MailModule } from '../mail/mail.module';
import { UserModule } from '../user/user.module';
import { AuthMapperProfile } from './auth-mapper.profile';
import { AuthController } from './controller/auth.controller';
import { EmailVerificationCodeRepository } from './repository/email-verification-code.repository';
import { AuthService } from './service/auth.service';
import { EmailVerificationCodeService } from './service/email-verification-code.service';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({ global: true }),
    MailModule,
    DbModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    AuthMapperProfile,
    EmailVerificationCodeService,
    EmailVerificationCodeRepository,
  ],
})
export class AuthModule {}
