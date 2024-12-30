import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';

export class WorkoutResponseDto {
  @ApiProperty()
  @AutoMap()
  id: string;
  @ApiProperty()
  @AutoMap()
  name: string;
  @ApiProperty()
  @AutoMap()
  createdAt: Date;
  @ApiProperty()
  @AutoMap()
  duration: number;
  @ApiProperty({ type: () => WorkoutExerciseResponseDto, isArray: true })
  @AutoMap(() => WorkoutExerciseResponseDto)
  exercises: WorkoutExerciseResponseDto[];
}

export class WorkoutExerciseResponseDto {
  @ApiProperty()
  @AutoMap()
  id: string;
  @ApiProperty()
  @AutoMap()
  name: string;
  @ApiProperty()
  @AutoMap()
  order: number;
  @ApiProperty({ type: () => WorkoutSetResponseDto, isArray: true })
  @AutoMap(() => WorkoutSetResponseDto)
  sets: WorkoutSetResponseDto[];
}

export class WorkoutSetResponseDto {
  @ApiProperty()
  @AutoMap()
  id: string;
  @ApiProperty()
  @AutoMap()
  order: number;
  @ApiProperty()
  @AutoMap()
  weight: number;
  @ApiProperty()
  @AutoMap()
  reps: number;
  @ApiProperty({ type: Number, nullable: true })
  @AutoMap()
  rpe: number | null;
}
