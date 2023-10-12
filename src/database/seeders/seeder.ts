import { Injectable } from '@nestjs/common';
import { ExerciseSeederService } from './exercises/exercise-seeder.service';
import { UserSeederService } from './users/users-seeder.service';

@Injectable()
export class Seeder {
  private userSeederService: UserSeederService;
  private exerciseSeederService: ExerciseSeederService;

  constructor(
    userSeederService: UserSeederService,
    exerciseSeederService: ExerciseSeederService,
  ) {
    this.userSeederService = userSeederService;
    this.exerciseSeederService = exerciseSeederService;
  }

  async seed() {
    try {
      console.log('Inserting users...');
      await this.sleep(1000); // simulate longer insert (makes console logs look better)
      await this.userSeederService.deleteAllUsers();
      const createdUserIds = await this.userSeederService.create();
      console.log(`Inserted ${createdUserIds.length} users into database \n`);
      await this.sleep(1000); // simulate longer insert (makes console logs look better)

      console.log('Inserting exercises...');
      await this.sleep(1000); // simulate longer insert (makes console logs look better)
      await this.exerciseSeederService.deleteAllExercises();
      const numExercisesInserted =
        await this.exerciseSeederService.create(createdUserIds);
      console.log(
        `Inserted ${numExercisesInserted} exercises into database \n`,
      );
      await this.sleep(1000); // simulate longer insert (makes console logs look better)
    } catch (error) {
      throw error;
    }
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
