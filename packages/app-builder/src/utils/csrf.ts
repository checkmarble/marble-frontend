export class CsrfError extends Error {
  constructor() {
    super('Invalid CSRF token');
    this.name = 'CsrfError';
  }
}
