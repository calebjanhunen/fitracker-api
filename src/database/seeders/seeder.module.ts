import { Module } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { ExerciseSeederModule } from './exercises/exercise-seeder.module';
import { Seeder } from './seeder';
import { UserSeederModule } from './users/user-seeder.module';

@Module({
  imports: [AppModule, UserSeederModule, ExerciseSeederModule],
  providers: [Seeder],
})
export class SeederModule {}
