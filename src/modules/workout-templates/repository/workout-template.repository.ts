import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
import { WorkoutTemplate } from '../models/workout-template.entity';

abstract class BaseRepository<T extends ObjectLiteral> {
  constructor(private repo: Repository<T>) {}
  async save(entity: T): Promise<T> {
    return await this.repo.save(entity);
  }
}

@Injectable()
export class WorkoutTemplateRepository extends BaseRepository<WorkoutTemplate> {
  constructor(
    @InjectRepository(WorkoutTemplate)
    workoutTemplateRepo: Repository<WorkoutTemplate>,
  ) {
    super(workoutTemplateRepo);
  }
}
