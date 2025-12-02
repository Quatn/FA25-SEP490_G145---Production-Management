import { SerializedError } from "@reduxjs/toolkit"
import { FetchBaseQueryError } from "@reduxjs/toolkit/query"
import check from "check-types"
import { deverror } from "./deverror";

export const tryGetApiErrorMsg = (error?: Error| FetchBaseQueryError | SerializedError, altHandler?: (err: Error) => string | undefined) => {
  if (!check.object(error)) {
    return undefined;
  }

  try {
    return (error as { data?: { message?: string } }).data?.message
  }
  catch (e) {
    if (!altHandler) {
      deverror("Encountered error that doesn't follow conventional error with message format, please add an altHandler to handle it.", e)
      return undefined
    }

    if (!(e instanceof Error)) {
      deverror("Caught an non-error object.", e)
      return undefined
    }

    const altMsg = altHandler(e)

    if (!altMsg) {
      deverror("Alt handler returned undefined, which is understood as missing handle case.", e)
    }

    return altMsg
  }
}
