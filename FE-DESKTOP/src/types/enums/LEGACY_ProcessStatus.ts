/** @deprecated Use OrderFinishingProcess if possible, that's what this is supposed to be */
// Added LEGACY prefix to name because its name is too short and non-descriptive otherwise
export enum LEGACY_ProcessStatus {
  NOTSTARTED = "NOTSTARTED",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  OVERCOMPLETED = "OVERCOMPLETED",
  PAUSED = "PAUSED",
  CANCELLED = "CANCELLED",
}
