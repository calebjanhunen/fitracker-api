import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/common/repository/base.repository';
import { Repository } from 'typeorm';
import { WorkoutTemplate } from '../models/workout-template.entity';

@Injectable()
export class WorkoutTemplateRepository extends BaseRepository<WorkoutTemplate> {
  constructor(
    @InjectRepository(WorkoutTemplate)
    private repo: Repository<WorkoutTemplate>,
  ) {
    super(repo);
  }

  public async findById(
    id: string,
    userId: string,
  ): Promise<WorkoutTemplate | null> {
    const qb = this.repo.createQueryBuilder('wt');

    qb.leftJoinAndSelect('wt.workoutTemplateExercises', 'wte')
      .leftJoinAndSelect('wte.sets', 'sets')
      .where('wt.id = :id', { id })
      .andWhere('wt.user_id = :userId', { userId });

    return await qb.getOne();
  }
}
