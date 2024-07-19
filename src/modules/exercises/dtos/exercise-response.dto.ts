export class ExerciseResponseDto {
  public id: string;
  public name: string;
  public difficultyLevel: string;
  public equipment: string;
  public instructions: string[];
  public primaryMuscle: string;
  public secondaryMuscles: string[];
  public isCustom: boolean;
  public userId: string | undefined;
}
