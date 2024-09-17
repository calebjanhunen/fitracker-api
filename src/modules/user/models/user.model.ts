export class UserModel {
  id: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  totalXp: number;

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
