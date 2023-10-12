import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IExercise } from 'src/interfaces';
import { Exercise, User } from 'src/model';
import { Repository } from 'typeorm';

@Injectable()
export default class ExercisesService {
  private exerciseRepo: Repository<Exercise>;

  constructor(@InjectRepository(Exercise) exerciseRepo: Repository<Exercise>) {
    this.exerciseRepo = exerciseRepo;
  }

  async getDefaultAndUserCreatedExercises(user: User): Promise<IExercise[]> {
    const defaultExercises = await this.getDefaultExercises();
    const userCreatedExercises = await this.getUserCreatedExercises(user);

    const allExercises = [...defaultExercises, ...userCreatedExercises];

    // Sort alphabetically
    allExercises.sort((a, b) => a.name.localeCompare(b.name));
    return allExercises;
  }

  async getDefaultExercises(): Promise<IExercise[]> {
    return await this.exerciseRepo.find({
      where: {
        isCustom: false,
      },
    });
  }

  async getUserCreatedExercises(user: User): Promise<IExercise[]> {
    return await this.exerciseRepo.findBy({ user: { id: user.id } });
  }
}
