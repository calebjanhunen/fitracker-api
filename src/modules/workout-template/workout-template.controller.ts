import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { WorkoutTemplateRequestDto } from './dtos/workout-template-request.dto';
import { InsertWorkoutTemplateModel } from './models/insert-workout-template.model';

@Controller('/api/workout-templates')
@UseGuards(AuthGuard)
export class WorkoutTemplateController {
  constructor(@InjectMapper() private mapper: Mapper) {}

  @Post()
  public async createWorkoutTemplate(
    @Body() dto: WorkoutTemplateRequestDto,
    @Headers('user-id') userId: string,
  ): Promise<string> {
    const model = this.mapper.map(
      dto,
      WorkoutTemplateRequestDto,
      InsertWorkoutTemplateModel,
    );

    return 'success';
  }
}
