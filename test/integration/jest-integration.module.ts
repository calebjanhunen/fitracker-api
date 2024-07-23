import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/modules/auth/auth.module';
import { ExerciseModule } from 'src/modules/exercises/exercises.module';
import { UserModule } from 'src/modules/user/user.module';
import { WorkoutTemplatesModule } from 'src/modules/workout-templates/workout-templates.module';
import { WorkoutsModule } from 'src/modules/workouts/workouts.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      port: parseInt(process.env.POSTGRES_PORT as string),
      host: process.env.POSTGRES_HOST,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      // entities: [__dirname + '/../model/*.entity.{ts,js}'],
      migrationsTableName: 'migrations',
      migrations: [__dirname + '/../database/migrations/*.ts'],
      namingStrategy: new SnakeNamingStrategy(),
      synchronize: true,
      autoLoadEntities: true,
      dropSchema: true,
    }),
    ExerciseModule,
    UserModule,
    AuthModule,
    WorkoutsModule,
    WorkoutTemplatesModule,
  ],
})
export class IntegrationTestModule {}
