import { createNamespace, Namespace } from 'cls-hooked';

const NAMESPACE = 'request';
const CORRELATION_ID = 'correlationId';

export class CorrelationIdService {
  private static namespace: Namespace;

  private static getNamespace(): Namespace {
    if (!this.namespace) {
      this.namespace = createNamespace(NAMESPACE);
    }
    return this.namespace;
  }

  // Set the correlation ID
  public static setCorrelationId(correlationId: string): void {
    const namespace = this.getNamespace();
    namespace.set(CORRELATION_ID, correlationId);
  }

  // Get the correlation ID
  public static getCorrelationId(): string | undefined {
    const namespace = this.getNamespace();
    return namespace.get(CORRELATION_ID);
  }
}
