import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exercise } from 'src/model';
import { UserModule } from 'src/modules/user/user.module';
import { ExerciseSeederService } from './exercise-seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([Exercise]), UserModule],
  providers: [ExerciseSeederService],
  exports: [ExerciseSeederService],
})
export class ExerciseSeederModule {}
