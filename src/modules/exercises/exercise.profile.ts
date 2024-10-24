import { createMap, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { WorkoutSetResponseDto } from '../workouts/dtos/workout-response.dto';
import { WorkoutSetModel } from '../workouts/models';
import {
  ExerciseDetailsDto,
  ExerciseWorkoutDetailsDto,
} from './dtos/exercise-details.dto';
import {
  ExerciseDetailsModel,
  ExerciseWorkoutDetailsModel,
} from './models/exercise-details.model';

@Injectable()
export class ExerciseProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, WorkoutSetModel, WorkoutSetResponseDto);
      createMap(mapper, ExerciseWorkoutDetailsModel, ExerciseWorkoutDetailsDto);
      createMap(mapper, ExerciseDetailsModel, ExerciseDetailsDto);
    };
  }
}
