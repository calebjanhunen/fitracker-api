import { IsInt, IsOptional } from 'class-validator';

export class PaginationParams {
  @IsInt()
  @IsOptional()
  public page: number = 1;

  @IsInt()
  @IsOptional()
  public limit: number = 10;
}
