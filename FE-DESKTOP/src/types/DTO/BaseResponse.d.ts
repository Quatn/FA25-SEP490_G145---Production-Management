export class BaseResponse<TData = object, TError = object> {
  success: boolean;
  message: string;
  data?: TData;
  error?: TError;
}
