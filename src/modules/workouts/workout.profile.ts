import { createMap, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import {
  CreateWorkoutResponseDto,
  WorkoutStatsDto,
} from './dtos/create-workout-response.dto';
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
import {
  InsertWorkoutExerciseModel,
  InsertWorkoutModel,
  InsertWorkoutSetModel,
  WorkoutExerciseModel,
  WorkoutModel,
  WorkoutSetModel,
} from './models';
import { CreateWorkout, WorkoutStats } from './models/create-workout';

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
      createMap(mapper, WorkoutModel, WorkoutResponseDto);
      createMap(mapper, WorkoutExerciseModel, WorkoutExerciseResponseDto);
      createMap(mapper, WorkoutSetModel, WorkoutSetResponseDto);
      createMap(mapper, WorkoutStats, WorkoutStatsDto);
    };
  }
}
