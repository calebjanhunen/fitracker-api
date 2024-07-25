import {
  Body,
  ConflictException,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ResourceNotFoundException } from 'src/common/internal-exceptions/resource-not-found.exception';
import { CreateWorkoutTemplateDto } from '../dto/create-workout-template.dto';
import { WorkoutTemplateResponseDto } from '../dto/workout-template-response.dto';
import { WorkoutTemplateService } from '../service/workout-template.service';

@Controller('api/workout-templates')
@UseGuards(AuthGuard)
export class WorkoutTemplateController {
  constructor(private workoutTemplateService: WorkoutTemplateService) {}

  @Post()
  public async createWorkoutTemplate(
    @Body() createWorkoutTemplateDto: CreateWorkoutTemplateDto,
    @Headers('user-id') userId: string,
  ): Promise<WorkoutTemplateResponseDto> {
    try {
      const createdWorkoutTemplate =
        await this.workoutTemplateService.createWorkoutTemplate(
          createWorkoutTemplateDto,
          userId,
        );
      return createdWorkoutTemplate;
    } catch (e) {
      if (e instanceof ResourceNotFoundException)
        throw new NotFoundException(e.message);
      throw new ConflictException(e.message);
    }
  }

  @Get(':id')
  public async getSingleWorkoutTemplate(
    @Headers('user-id') userId: string,
    @Param('id') id: string,
  ): Promise<WorkoutTemplateResponseDto> {
    try {
      const workoutTemplate =
        await this.workoutTemplateService.getSingleWorkoutTemplate(id, userId);
      return workoutTemplate;
    } catch (e) {
      if (e instanceof ResourceNotFoundException)
        throw new NotFoundException(e.message);
      throw new ConflictException(e.message);
    }
  }

  @Get()
  public async getWorkoutTemplates(
    @Headers('user-id') userId: string,
  ): Promise<WorkoutTemplateResponseDto[]> {
    try {
      const workoutTemplates =
        await this.workoutTemplateService.getAllWorkoutTemplates(userId);
      return workoutTemplates;
    } catch (e) {
      if (e instanceof ResourceNotFoundException)
        throw new NotFoundException(e.message);
      throw new ConflictException(e.message);
    }
  }
}
