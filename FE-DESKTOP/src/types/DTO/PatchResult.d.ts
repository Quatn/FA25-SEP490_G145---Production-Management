export interface PatchResult<T = object> {
  requestedAmount: number;
  patchedAmount: number;
  echo?: T;
}
