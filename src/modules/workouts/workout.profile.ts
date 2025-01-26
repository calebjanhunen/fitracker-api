import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { WorkoutSummaryDto } from './dtos';
import {
  CreateWorkoutResponseDto,
  UserStatsAfterWorkoutDto,
  UserStatsBeforeWorkoutDto,
  WorkoutStatsDto,
} from './dtos/create-workout-response.dto';
import { DeleteWorkoutDto } from './dtos/delete-workout-response.dto';
import {
  WorkoutExerciseRequestDto,
  WorkoutRequestDto,
  WorkoutSetRequestDto,
} from './dtos/workout-request.dto';
import {
  WorkoutExerciseResponseDto,
  WorkoutResponseDto,
  WorkoutSetResponseDto,
} from './dtos/workout-response.dto';
import { DeleteWorkout } from './interfaces/delete-workout.interface';
import {
  InsertWorkoutExerciseModel,
  InsertWorkoutModel,
  InsertWorkoutSetModel,
  WorkoutExerciseModel,
  WorkoutModel,
  WorkoutSetModel,
  WorkoutSummaryExerciseModel,
  WorkoutSummaryModel,
} from './models';
import {
  CreateWorkout,
  UserStatsAfterWorkout,
  UserStatsBeforeWorkout,
  WorkoutStats,
} from './models/create-workout';

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
      createMap(mapper, WorkoutSummaryExerciseModel, WorkoutSummaryDto);
      createMap(
        mapper,
        WorkoutSummaryModel,
        WorkoutSummaryDto,
        forMember(
          (dest) => dest.exercises,
          mapFrom((src) => src.exercises),
        ),
      );
    };
  }
}
