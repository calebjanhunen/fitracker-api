import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class WorkoutResponseDto {
  @ApiProperty()
  @Expose()
  id: string;
  @ApiProperty()
  @Expose()
  name: string;
  @ApiProperty()
  @Expose()
  createdAt: Date;
  @ApiProperty()
  @Expose()
  duration: number;
  @ApiProperty({ type: () => WorkoutExerciseResponseDto, isArray: true })
  @Expose()
  exercises: WorkoutExerciseResponseDto[];
}

export class WorkoutExerciseResponseDto {
  @ApiProperty()
  @Expose()
  id: string;
  @ApiProperty()
  @Expose()
  name: string;
  @ApiProperty()
  @Expose()
  order: number;
  @ApiProperty({ type: () => WorkoutSetResponseDto, isArray: true })
  @Expose()
  sets: WorkoutSetResponseDto[];
}

export class WorkoutSetResponseDto {
  @ApiProperty()
  @AutoMap()
  @Expose()
  id: string;
  @ApiProperty()
  @AutoMap()
  @Expose()
  order: number;
  @ApiProperty()
  @AutoMap()
  @Expose()
  weight: number;
  @ApiProperty()
  @AutoMap()
  @Expose()
  reps: number;
  @ApiProperty({ type: Number, nullable: true })
  @AutoMap()
  @Expose()
  rpe: number | null;
}
