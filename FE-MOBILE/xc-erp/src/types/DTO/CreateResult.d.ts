export interface CreateResult<T = object> {
  requestedAmount: number;
  createdAmount: number;
  echo?: T;
}
