import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DbModule } from 'src/common/database/database.module';
import { LoggerServiceV2 } from 'src/common/logger/logger-v2.service';
import { MailModule } from '../mail/mail.module';
import { UserModule } from '../user/user.module';
import { AuthMapperProfile } from './auth-mapper.profile';
import { AuthController } from './controller/auth.controller';
import { AuthSignupCodeRepository } from './repository/auth-signup-code.repository';
import { AuthService } from './service/auth.service';
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
    LoggerServiceV2,
    JwtRefreshStrategy,
    AuthMapperProfile,
    AuthSignupCodeRepository,
  ],
})
export class AuthModule {}
