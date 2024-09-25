import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Body,
  ConflictException,
  Controller,
  Headers,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { WorkoutTemplateRequestDto } from './dtos/workout-template-request.dto';
import { WorkoutTemplateResponseDto } from './dtos/workout-template-response.dto';
import { WorkoutTemplateModel } from './models';
import { InsertWorkoutTemplateModel } from './models/insert-workout-template.model';
import { WorkoutTemplateService } from './workout-template.service';

@Controller('/api/workout-templates')
@UseGuards(AuthGuard)
export class WorkoutTemplateController {
  constructor(
    @InjectMapper() private mapper: Mapper,
    private workoutTemplateService: WorkoutTemplateService,
  ) {}

  @Post()
  public async createWorkoutTemplate(
    @Body() dto: WorkoutTemplateRequestDto,
    @Headers('user-id') userId: string,
  ): Promise<WorkoutTemplateResponseDto> {
    const model = this.mapper.map(
      dto,
      WorkoutTemplateRequestDto,
      InsertWorkoutTemplateModel,
    );

    try {
      const createdWorkoutTemplate =
        await this.workoutTemplateService.createWorkoutTemplate(model, userId);

      return this.mapper.map(
        createdWorkoutTemplate,
        WorkoutTemplateModel,
        WorkoutTemplateResponseDto,
      );
    } catch (e) {
      throw new ConflictException(e.message);
    }
  }
}
