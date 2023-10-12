import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exercise } from 'src/model';
import { UserModule } from '../user/user.module';
import ExercisesController from './controller/exercises.controller';
import ExercisesService from './services/exercises.service';

@Module({
  imports: [TypeOrmModule.forFeature([Exercise]), UserModule],
  controllers: [ExercisesController],
  providers: [ExercisesService],
})
export class ExerciseModule {}
