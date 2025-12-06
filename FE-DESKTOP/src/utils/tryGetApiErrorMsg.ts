import { SerializedError } from "@reduxjs/toolkit"
import { FetchBaseQueryError } from "@reduxjs/toolkit/query"
import check from "check-types"
import { deverror } from "./deverror";

export const tryGetApiErrorMsg = (error?: Error | FetchBaseQueryError | SerializedError, altHandler?: ((err: object) => string | undefined) | false) => {
  if (!check.object(error)) {
    return undefined;
  }

  try {
    const errMsg = (error as { data?: { message?: string } }).data?.message

    if (!check.undefined(errMsg)) return errMsg;

    if (!altHandler) {
      if (check.undefined(altHandler)) {
        deverror("API error handler function: Api slice returned an error that doesn't follow conventional error with message format, consider adding a handler function in the future.", error)
      }
      return undefined
    }

    const altMsg = altHandler(error)

    if (!altMsg) {
      deverror("API error handler function: Alt handler returned undefined, which is considered as missing handle case.", error)
    }

    return altMsg

  }
  catch (e) {
    if (!altHandler) {
      deverror("API error handler function: Type error.", e)
      return undefined
    }
  }
}
