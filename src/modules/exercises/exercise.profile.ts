import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { WorkoutSetResponseDto } from '../workouts/dtos';
import { WorkoutSetModel } from '../workouts/models';
import {
  BodyPartDto,
  CreateExerciseVariationDto,
  EquipmentDto,
  ExerciseDetailsDto,
  ExerciseResponseDto,
  ExerciseVariationDto,
  ExerciseWorkoutHistoryDto,
  LookupItemDto,
  RecentSetDto,
  UpdateExerciseVariationDto,
} from './dtos';
import {
  BodyPartModel,
  CreateExerciseVariationModel,
  EquipmentModel,
  ExerciseDetailsModel,
  ExerciseModel,
  ExerciseVariationModel,
  ExerciseWorkoutHistoryModel,
  LookupItem,
  RecentSetModel,
  UpdateExerciseVariationModel,
} from './models';

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
      createMap(mapper, EquipmentModel, EquipmentDto);
      createMap(mapper, BodyPartModel, BodyPartDto);
      createMap(mapper, LookupItem, LookupItemDto);
      createMap(
        mapper,
        CreateExerciseVariationDto,
        CreateExerciseVariationModel,
      );
      createMap(mapper, ExerciseVariationModel, ExerciseVariationDto);
      createMap(
        mapper,
        UpdateExerciseVariationDto,
        UpdateExerciseVariationModel,
      );
      createMap(mapper, ExerciseModel, ExerciseResponseDto);
      createMap(mapper, RecentSetModel, RecentSetDto);
    };
  }
}
