import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/api/user/user.module';
import { Exercise } from 'src/model';
import { ExerciseSeederService } from './exercise-seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([Exercise]), UserModule],
  providers: [ExerciseSeederService],
  exports: [ExerciseSeederService],
})
export class ExerciseSeederModule {}
