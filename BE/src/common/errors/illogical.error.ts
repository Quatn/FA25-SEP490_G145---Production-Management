export class IllogicalError extends Error {
  constructor(message = "Illogical evaluation encountered") {
    super(message);
    this.name = "IllogicalError";
  }
}
