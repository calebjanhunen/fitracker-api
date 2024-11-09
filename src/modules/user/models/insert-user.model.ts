import { AutoMap } from '@automapper/classes';

export class InsertUserModel {
  @AutoMap()
  username: string;
  @AutoMap()
  password: string;
  @AutoMap()
  firstName: string;
  @AutoMap()
  lastName: string;
  @AutoMap()
  email: string;
}
