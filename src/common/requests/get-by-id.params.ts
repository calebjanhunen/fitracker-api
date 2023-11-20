import { IsUUID } from 'class-validator';

export class GetByIdParam {
  @IsUUID()
  public id: string;
}
