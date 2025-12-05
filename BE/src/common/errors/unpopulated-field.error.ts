export class UnpopulatedFieldError extends Error {
  constructor(message = "A field should have been populated but is not") {
    super(message);
    this.name = "UnpopulatedFieldError";
  }
}
