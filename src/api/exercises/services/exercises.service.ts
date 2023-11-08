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
    const [exercises] = await this.exerciseRepo.findAndCount({
      where: [{ isCustom: false }, { user: { id: user.id } }],
    });
    return exercises;
  }
}
