import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { v4 as uuidv4 } from 'uuid';
import { LoggerService } from './logger.service';

@Global()
@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      providers: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          pinoHttp: {
            autoLogging: false,
            genReqId: (request) =>
              request.headers['x-correlation-id'] || uuidv4(),
            redact: {
              paths: [
                'req.headers.authorization',
                "req.headers['x-refresh-token']",
              ],
            },
            transport: {
              targets: [
                {
                  target: '@logtail/pino',
                  options: {
                    sourceToken: configService.getOrThrow(
                      'LOGTAIL_SOURCE_TOKEN',
                    ),
                  },
                  worker: false,
                },
              ],
            },
          },
        };
      },
    }),
  ],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
