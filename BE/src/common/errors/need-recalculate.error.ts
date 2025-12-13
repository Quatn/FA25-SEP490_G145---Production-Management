export class NeedRecalculateError extends Error {
  constructor(
    message = "An object of a denormalized schema needs to be recalculated",
  ) {
    super(message);
    this.name = "NeedRecalculateError";
  }
}
