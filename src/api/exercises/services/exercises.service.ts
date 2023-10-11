import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Exercise, User } from 'src/model';
import { Repository } from 'typeorm';

@Injectable()
export default class ExercisesService {
  private exerciseRepo: Repository<Exercise>;

  constructor(@InjectRepository(Exercise) exerciseRepo: Repository<Exercise>) {
    this.exerciseRepo = exerciseRepo;
  }

  async getDefaultExercises(): Promise<Exercise[]> {
    return await this.exerciseRepo.find({
      where: {
        isCustom: false,
      },
    });
  }

  async getUserCreatedWorkouts(user: User): Promise<Exercise[]> {
    return await this.exerciseRepo.find({
      where: {
        user: user,
      },
    });
  }
}
