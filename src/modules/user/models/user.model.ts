import { AutoMap } from '@automapper/classes';

export class UserModel {
  @AutoMap()
  id: string;
  @AutoMap()
  username: string;
  password: string;
  @AutoMap()
  firstName: string;
  @AutoMap()
  lastName: string;
  @AutoMap()
  email: string;
  @AutoMap()
  totalXp: number;
  @AutoMap()
  weeklyWorkoutGoal: number;
  isVerified: boolean;

  constructor(
    id: string,
    username: string,
    password: string,
    firstName: string,
    lastName: string,
    email: string,
  ) {
    this.id = id;
    this.username = username;
    this.password = password;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
  }
}
