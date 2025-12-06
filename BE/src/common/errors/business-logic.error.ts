export class BusinessLogicError extends Error {
  constructor(
    message = "Encountered improperly formated data or incorrect evaluations that broke business constraints",
  ) {
    super(message);
    this.name = "BusinessLogicError";
  }
}
