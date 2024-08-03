import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/common/repository/base.repository';
import { DataSource, Repository } from 'typeorm';
import { WorkoutTemplate } from '../models/workout-template.entity';

@Injectable()
export class WorkoutTemplateRepository extends BaseRepository<WorkoutTemplate> {
  constructor(
    @InjectRepository(WorkoutTemplate)
    private repo: Repository<WorkoutTemplate>,
    private dataSource: DataSource,
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

  public async update(
    updateEntity: WorkoutTemplate,
    existingEntity: WorkoutTemplate,
    userId: string,
  ): Promise<WorkoutTemplate | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Delete sets in existingEntity but not in updateEntity
      const setsToDelete = existingEntity.workoutTemplateExercises.flatMap(
        (existingExercise) => {
          // Find exercise in updateEntity - if it doesnt exist, return all sets to delete
          const updateExercise = updateEntity.workoutTemplateExercises.find(
            (updateE) => updateE.id === existingExercise.id,
          );
          if (!updateExercise) return existingExercise.sets;

          // If exercise does exist, return sets that don't exist in updateExercise
          const updateSetIds = updateExercise.sets.map((set) => set.id);
          return existingExercise.sets.filter(
            (existingSet) => !updateSetIds.includes(existingSet.id),
          );
        },
      );
      await queryRunner.manager.remove(setsToDelete);

      // Delete exercises in existingEntity but not in updateEntity
      const updateWorkoutTemplateExerciseIds =
        updateEntity.workoutTemplateExercises.map((e) => e.id);
      const exercisesToDelete = existingEntity.workoutTemplateExercises.filter(
        (existingExercise) =>
          !updateWorkoutTemplateExerciseIds.includes(existingExercise.id),
      );
      await queryRunner.manager.remove(exercisesToDelete);

      await queryRunner.manager.save(updateEntity);
      await queryRunner.commitTransaction();
    } catch (e) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }

    return await this.findById(existingEntity.id, userId);
  }
}
