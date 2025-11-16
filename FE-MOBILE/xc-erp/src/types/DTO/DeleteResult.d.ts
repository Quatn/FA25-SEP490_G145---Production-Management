export interface DeleteResult<T = object> {
  requestedAmount: number;
  deletedAmount: number;
  echo?: T;
}
