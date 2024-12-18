import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { WorkoutTemplateRequestDto } from './dtos/workout-template-request.dto';
import { WorkoutTemplateResponseDto } from './dtos/workout-template-response.dto';
import { WorkoutTemplateModel } from './models';
import { InsertWorkoutTemplateModel } from './models/insert-workout-template.model';
import { WorkoutTemplateService } from './workout-template.service';

@Controller('/api/workout-templates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiTags('Workout Templates')
export class WorkoutTemplateController {
  constructor(
    @InjectMapper() private mapper: Mapper,
    private workoutTemplateService: WorkoutTemplateService,
  ) {}

  @Post()
  @ApiResponse({ status: HttpStatus.CREATED, type: WorkoutTemplateResponseDto })
  @ApiResponse({ status: HttpStatus.CONFLICT })
  public async createWorkoutTemplate(
    @Body() dto: WorkoutTemplateRequestDto,
    @CurrentUser() userId: string,
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

  @Get()
  @ApiResponse({
    status: HttpStatus.OK,
    type: WorkoutTemplateResponseDto,
    isArray: true,
  })
  @ApiResponse({ status: HttpStatus.CONFLICT })
  public async getAllWorkoutTemplates(
    @CurrentUser() userId: string,
  ): Promise<WorkoutTemplateResponseDto[]> {
    try {
      const workoutTemplates =
        await this.workoutTemplateService.findAllWorkoutTemplates(userId);
      return this.mapper.mapArray(
        workoutTemplates,
        WorkoutTemplateModel,
        WorkoutTemplateResponseDto,
      );
    } catch (e) {
      throw new ConflictException(e.message);
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  public async deleteWorkoutTemplate(
    @CurrentUser() userId: string,
    @Param('id') workoutTemplateId: string,
  ): Promise<void> {
    try {
      await this.workoutTemplateService.deleteWorkoutTemplate(
        workoutTemplateId,
        userId,
      );
    } catch (e) {
      if (e instanceof ResourceNotFoundException) {
        throw new NotFoundException(e.message);
      }
      throw new ConflictException(e.message);
    }
  }
}
