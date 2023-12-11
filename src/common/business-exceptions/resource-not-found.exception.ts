import { BaseException } from './base.exception';

export class ResourceNotFoundException extends BaseException {
  constructor(message: string) {
    super(message);
  }
}
