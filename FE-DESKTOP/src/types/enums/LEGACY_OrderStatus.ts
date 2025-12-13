/** @deprecated MO wont have status, it is supposed to derive its status from other objects is it associated with */
// Added LEGACY prefix to name because its name is too short and non-descriptive otherwise
export enum LEGACY_OrderStatus {
  NOTSTARTED = "NOTSTARTED",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  OVERCOMPLETED = "OVERCOMPLETED",
  PAUSED = "PAUSED",
  CANCELLED = "CANCELLED",
}
