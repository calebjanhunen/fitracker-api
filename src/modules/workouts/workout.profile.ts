import { createMap, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import {
  CreateWorkoutResponseDto,
  DeleteWorkoutDto,
  UserStatsAfterWorkoutDto,
  UserStatsBeforeWorkoutDto,
  WorkoutExerciseRequestDto,
  WorkoutExerciseResponseDto,
  WorkoutRequestDto,
  WorkoutResponseDto,
  WorkoutSetRequestDto,
  WorkoutSetResponseDto,
  WorkoutStatsDto,
  WorkoutSummaryDto,
  WorkoutSummaryExerciseDto,
} from './dtos';
import { DeleteWorkout } from './interfaces';
import {
  CreateWorkout,
  InsertWorkoutExerciseModel,
  InsertWorkoutModel,
  InsertWorkoutSetModel,
  UserStatsAfterWorkout,
  UserStatsBeforeWorkout,
  WorkoutExerciseModel,
  WorkoutModel,
  WorkoutSetModel,
  WorkoutStats,
  WorkoutSummaryExerciseModel,
  WorkoutSummaryModel,
} from './models';

@Injectable()
export class WorkoutProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, WorkoutRequestDto, InsertWorkoutModel);
      createMap(mapper, WorkoutExerciseRequestDto, InsertWorkoutExerciseModel);
      createMap(mapper, WorkoutSetRequestDto, InsertWorkoutSetModel);
      createMap(mapper, CreateWorkout, CreateWorkoutResponseDto);
      createMap(mapper, UserStatsBeforeWorkout, UserStatsBeforeWorkoutDto);
      createMap(mapper, UserStatsAfterWorkout, UserStatsAfterWorkoutDto);
      createMap(mapper, WorkoutModel, WorkoutResponseDto);
      createMap(mapper, WorkoutExerciseModel, WorkoutExerciseResponseDto);
      createMap(mapper, WorkoutSetModel, WorkoutSetResponseDto);
      createMap(mapper, WorkoutStats, WorkoutStatsDto);
      createMap(mapper, DeleteWorkout, DeleteWorkoutDto);
      createMap(mapper, WorkoutSummaryExerciseModel, WorkoutSummaryExerciseDto);
      createMap(mapper, WorkoutSummaryModel, WorkoutSummaryDto);
    };
  }
}
