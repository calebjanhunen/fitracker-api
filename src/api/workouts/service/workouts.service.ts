import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Set, Workout } from 'src/model';
import { Repository } from 'typeorm';

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

  async createWorkout(workout: Workout): Promise<void> {
    const createdWorkout = await this.workoutRepo.save(workout);
    for (let i = 0; i < workout.sets.length; i++) {
      workout.sets[i].workout = createdWorkout;
    }
    await this.setRepo.save(workout.sets);
  }
}
