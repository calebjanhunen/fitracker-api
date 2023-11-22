/**
 * Base error class thrown by services to be caught by controller layer / exception filter
 */
export class BaseError extends Error {
  constructor(message: string) {
    super(message);
  }
}
