export class UserModel {
  id: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;

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

  public static fromDbQuery(result: any): UserModel {
    return new UserModel(
      result.id,
      result.username,
      result.password,
      result.first_name,
      result.last_name,
      result.email,
    );
  }
}
