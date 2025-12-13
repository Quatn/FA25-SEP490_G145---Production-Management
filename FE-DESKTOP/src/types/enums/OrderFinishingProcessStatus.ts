// This *Will* be changed in the future
export enum OrderFinishingProcessStatus {
  PendingApproval = "PENDINGAPPROVAL",
  Approved = "APPROVED",
  Scheduled = "SCHEDULED", // wait
  OnHold = "ONHOLD",
  Cancelled = "CANCELLED",
  InProduction = "INPRODUCTION", // running 
  Paused = "PAUSED",
  FinishedProduction = "FINISHEDPRODUCTION", // done 
  QualityCheck = "QUALITYCHECK",
  Completed = "COMPLETED",
}
