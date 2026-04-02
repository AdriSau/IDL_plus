export class ExtensionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExtensionError';
  }
}

export class NotImplementedExtensionError extends ExtensionError {
  constructor(message: string) {
    super(message);
    this.name = 'NotImplementedExtensionError';
  }
}
