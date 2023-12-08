import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResourceNotFoundException } from 'src/common/business-exceptions/resource-not-found.exception';
import { Set, User, Workout } from 'src/model';
import { EntityNotFoundError, Repository } from 'typeorm';

@Injectable()
export class WorkoutsService {
  private workoutRepo: Repository<Workout>;
  private setRepo: Repository<Set>;

  constructor(
    @InjectRepository(Workout) workoutRepo: Repository<Workout>,
    @InjectRepository(Set) setRepo: Repository<Set>,
  ) {
    this.workoutRepo = workoutRepo;
    this.setRepo = setRepo;
  }

  async createWorkout(workout: Workout): Promise<string> {
    const createdWorkout = await this.workoutRepo.save(workout);
    for (let i = 0; i < workout.sets.length; i++) {
      workout.sets[i].workout = createdWorkout;
    }
    await this.setRepo.save(workout.sets);

    return createdWorkout.id;
  }

  /**
   * Gets a workout by its id.
   *
   * @param {string} workoutId The id of the workout.
   * @param {string} userId    The id of the user.
   *
   * @return {Workout}
   *
   * @throws {ResourceNotFoundException}
   */
  async getById(workoutId: string, userId: string): Promise<Workout> {
    const workout = await this.workoutRepo.findOne({
      where: { id: workoutId, user: { id: userId } },
      relations: {
        exercises: true,
        sets: {
          exercise: true,
        },
      },
    });

    if (!workout) {
      throw new ResourceNotFoundException(
        'Workout could not be found using the provided id and user',
      );
    }

    return workout;
  }

  async getWorkouts(user: User): Promise<Workout[]> {
    // Get workout with exercises in workout
    const workouts = await this.workoutRepo.find({
      where: { user: { id: user.id } },
      select: {
        exercises: {
          id: true,
          name: true,
        },
      },
      relations: { exercises: true },
    });

    // Get sets
    for (let i = 0; i < workouts.length; i++) {
      const sets = await this.setRepo.find({
        where: {
          workout: { id: workouts[i].id },
        },
        select: {
          exercise: {
            id: true,
          },
        },
        relations: { exercise: true },
      });
      workouts[i].sets = sets;
    }

    return workouts;
  }

  /**
   * Deletes a workout given its id
   *
   * @param {string} workoutId
   * @param {string} userId
   *
   * @throws {EntityNotFoundError}
   */
  async deleteById(workoutId: string, userId: string): Promise<void> {
    const workout = await this.getById(workoutId, userId);
    await this.workoutRepo.remove(workout);
  }
}
