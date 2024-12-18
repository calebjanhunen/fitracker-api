import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';

export class WorkoutTemplateSetResponseDto {
  @AutoMap()
  @ApiProperty()
  id: string;
  @AutoMap()
  @ApiProperty()
  order: number;
}

export class WorkoutTemplateExerciseResponseDto {
  @AutoMap()
  @ApiProperty()
  exerciseId: string;
  @AutoMap()
  @ApiProperty()
  exerciseName: string;
  @AutoMap()
  @ApiProperty()
  order: number;
  @AutoMap(() => WorkoutTemplateSetResponseDto)
  @ApiProperty({ type: WorkoutTemplateSetResponseDto, isArray: true })
  sets: WorkoutTemplateSetResponseDto[];
}

export class WorkoutTemplateResponseDto {
  @AutoMap()
  @ApiProperty()
  id: string;
  @AutoMap()
  @ApiProperty()
  name: string;
  @AutoMap()
  @ApiProperty()
  createdAt: Date;
  @AutoMap(() => WorkoutTemplateExerciseResponseDto)
  @ApiProperty({ type: WorkoutTemplateExerciseResponseDto, isArray: true })
  exercises: WorkoutTemplateExerciseResponseDto[];
}
