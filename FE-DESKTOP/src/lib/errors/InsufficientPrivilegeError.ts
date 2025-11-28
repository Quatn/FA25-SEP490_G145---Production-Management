export class InsufficientPrivilegeError extends Error {
  path?: string;

  constructor(message = "Insufficient Privilege", path = undefined) {
    super(message);
    this.name = "InsufficientPrivilegeError";
    this.path = path;
  }
}
