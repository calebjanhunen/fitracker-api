import { createMap, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { CreateWorkoutTemplateDto } from './dtos/create-workout-template.dto';
import { InsertWorkoutTemplateModel } from './models/insert-workout-template.model';

@Injectable()
export class WorkoutTemplateProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, CreateWorkoutTemplateDto, InsertWorkoutTemplateModel);
    };
  }
}
