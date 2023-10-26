import { IsUUID } from 'class-validator';

export class GetSingleWorkoutParams {
  @IsUUID('4')
  id: string;
}
