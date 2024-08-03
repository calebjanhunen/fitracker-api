import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/common/repository/base.repository';
import { DataSource, Repository } from 'typeorm';
import { WorkoutTemplateExercise } from '../models/workout-template-exercise.entity';
import { WorkoutTemplateSet } from '../models/workout-template-set.entity';
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
    entity: WorkoutTemplate,
    existingEntity: WorkoutTemplate,
    userId: string,
  ): Promise<WorkoutTemplate | null> {
    // update workout template entity (name)
    /*
    update workout template exercises
      insert any new workoutTemplateExercises that are in the updatedEntity bu arent in the existingEntity
      delete any workoutTemplateExercises that are in the existingEntity but arent in the updatedEntity
      update existing workoutTemplateExercises that are both in the updatedEntity and existingEntity (order)

      update workoutTemplateSets for each exercise
        insert any new workoutTemplateSets
        delete any workoutTemplateSets not in updatedEntity
        update existing sets (type, order)
    */

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager
        .createQueryBuilder()
        .update(WorkoutTemplate)
        .set({ name: entity.name })
        .where('id = :id', { id: existingEntity.id })
        .execute();

      for (const workoutTemplateExercise of entity.workoutTemplateExercises) {
        if (!workoutTemplateExercise.id) {
          // Create workout template exercise
          await queryRunner.manager.save(workoutTemplateExercise);
        } else {
          // Update workout template exercise
          await queryRunner.manager
            .createQueryBuilder()
            .update(WorkoutTemplateExercise)
            .set({
              order: workoutTemplateExercise.order,
            })
            .where('id = :id', { id: workoutTemplateExercise.id })
            .execute();

          for (const workoutTemplateSet of workoutTemplateExercise.sets) {
            if (!workoutTemplateSet.id) {
              // Create workout template set
              await queryRunner.manager.save(workoutTemplateSet);
            } else {
              // Update workout template set
              await queryRunner.manager
                .createQueryBuilder()
                .update(WorkoutTemplateSet)
                .set({
                  order: workoutTemplateSet.order,
                  type: workoutTemplateSet.type,
                })
                .where('id = :id', { id: workoutTemplateSet.id })
                .execute();
            }
          }

          // delete sets that are in existing workout template exercise but not in updatedEntity exercise
          const existingWorkoutTemplateExercise =
            existingEntity.workoutTemplateExercises.find(
              (e) => e.id === workoutTemplateExercise.id,
            )!;
          const workoutTemplateSetIds = workoutTemplateExercise.sets.map(
            (set) => set.id,
          );
          for (const existingWorkoutTemplateSet of existingWorkoutTemplateExercise.sets) {
            if (
              !workoutTemplateSetIds.includes(existingWorkoutTemplateSet.id)
            ) {
              await queryRunner.manager.remove(existingWorkoutTemplateSet);
            }
          }
        }
      }

      // Delete exercises in existingWorkoutTemplate but not in updatedEntity
      const workoutTemplateExerciseIds = entity.workoutTemplateExercises.map(
        (e) => e.id,
      );
      for (const existingWorkoutExercise of existingEntity.workoutTemplateExercises) {
        if (!workoutTemplateExerciseIds.includes(existingWorkoutExercise.id)) {
          await queryRunner.manager.remove(existingWorkoutExercise);
        }
      }
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
