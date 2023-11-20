export class ExerciseUserDoesNotMatchUserInRequestError extends Error {
  constructor() {
    super('User that the exercise belongs to does not match user in request');
  }
}
