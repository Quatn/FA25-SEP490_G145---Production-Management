export class InvalidDataTableConfigError extends Error {
  constructor(message = "Invalid DataTable Config") {
    super(message);
    this.name = "InvalidDataTableConfigError";
  }
}
