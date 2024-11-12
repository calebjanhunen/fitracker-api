import { BaseException } from 'src/common/internal-exceptions/base.exception';

export class MailFailedToSendException extends BaseException {
  constructor(e: Error) {
    super(e.message);
  }
}
