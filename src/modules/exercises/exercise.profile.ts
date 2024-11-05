import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { WorkoutSetResponseDto } from '../workouts/dtos/workout-response.dto';
import { WorkoutSetModel } from '../workouts/models';
import { ExerciseDetailsDto } from './dtos/exercise-details.dto';
import { ExerciseWorkoutHistoryDto } from './dtos/exercise-workout-history.dto';
import { ExerciseDetailsModel } from './models/exercise-details.model';
import { ExerciseWorkoutHistoryModel } from './models/exercise-workout-history.model';

@Injectable()
export class ExerciseProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        WorkoutSetModel,
        WorkoutSetResponseDto,
        forMember(
          (dest) => dest.rpe,
          mapFrom((src) => src.rpe),
        ),
      );
      createMap(mapper, ExerciseWorkoutHistoryModel, ExerciseWorkoutHistoryDto);
      createMap(mapper, ExerciseDetailsModel, ExerciseDetailsDto);
    };
  }
}
