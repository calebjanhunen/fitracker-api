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
      .leftJoin('wte.exercise', 'e')
      .addSelect(['e.id', 'e.name'])
      .leftJoinAndSelect('wte.sets', 'sets')
      .where('wt.id = :id', { id })
      .andWhere('wt.user_id = :userId', { userId })
      .orderBy('wte.order', 'ASC')
      .addOrderBy('sets.order', 'ASC');

    return await qb.getOne();
  }

  public async findMany(userId: string): Promise<WorkoutTemplate[]> {
    const qb = this.repo.createQueryBuilder('wt');

    qb.leftJoinAndSelect('wt.workoutTemplateExercises', 'wte')
      .leftJoin('wte.exercise', 'e')
      .addSelect(['e.id', 'e.name'])
      .leftJoinAndSelect('wte.sets', 'sets')
      .where('wt.user_id = :userId', { userId })
      .orderBy('wte.order', 'ASC')
      .addOrderBy('sets.order', 'ASC');
    return await qb.getMany();
  }

  public async delete(entity: WorkoutTemplate): Promise<void> {
    await this.repo.remove(entity);
  }

  public async update(entity: WorkoutTemplate): Promise<WorkoutTemplate> {
    return await this.repo.save(entity);
  }
}
