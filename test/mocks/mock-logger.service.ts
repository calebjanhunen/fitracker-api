export class MockLoggerService {
  constructor() {}

  log = jest.fn();
  error = jest.fn();
  warn = jest.fn();
  setContext = jest.fn();
  isProduction = jest.fn();
  shouldLog = jest.fn();
}
