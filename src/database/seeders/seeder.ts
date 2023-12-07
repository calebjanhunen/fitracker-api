import { Injectable } from '@nestjs/common';
import { ExerciseSeederService } from './exercises/exercise-seeder.service';
import { UserSeederService } from './users/users-seeder.service';
import { WorkoutSeederService } from './workouts/workout-seeder.service';

@Injectable()
export class Seeder {
  private userSeederService: UserSeederService;
  private exerciseSeederService: ExerciseSeederService;
  private workoutSeederService: WorkoutSeederService;

  constructor(
    userSeederService: UserSeederService,
    exerciseSeederService: ExerciseSeederService,
    workoutSeederService: WorkoutSeederService,
  ) {
    this.userSeederService = userSeederService;
    this.exerciseSeederService = exerciseSeederService;
    this.workoutSeederService = workoutSeederService;
  }

  async seed() {
    try {
      //Delete everything
      await this.workoutSeederService.deleteAllWorkouts();
      await this.exerciseSeederService.deleteAllExercises();
      await this.userSeederService.deleteAllUsers();

      console.log('Inserting users...');
      await this.sleep(1000); // simulate longer insert (makes console logs look better)
      const createdUserIds = await this.userSeederService.create();
      console.log(`Inserted ${createdUserIds.length} users into database \n`);
      await this.sleep(1000); // simulate longer insert (makes console logs look better)

      console.log('Inserting exercises...');
      await this.sleep(1000); // simulate longer insert (makes console logs look better)
      const numExercisesInserted =
        await this.exerciseSeederService.create(createdUserIds);
      if (!numExercisesInserted) {
        throw new Error('No exercises inserted');
      }
      console.log(
        `Inserted ${numExercisesInserted} exercises into database \n`,
      );
      await this.sleep(1000); // simulate longer insert (makes console logs look better)

      console.log('Inserting workouts...');
      await this.sleep(1000); // simulate longer insert (makes console logs look better)
      const numWorkoutsInserted = await this.workoutSeederService.create(
        createdUserIds,
        numExercisesInserted,
      );
      console.log(`Inserted ${numWorkoutsInserted} workouts into database \n`);
      await this.sleep(1000); // simulate longer insert (makes console logs look better)
    } catch (error) {
      throw error;
    }
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
