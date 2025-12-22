import { SerializedError } from "@reduxjs/toolkit"
import { FetchBaseQueryError } from "@reduxjs/toolkit/query"
import check from "check-types"
import { deverror } from "./deverror";
import { UnauthenticatedError } from "@/lib/errors/UnauthenticatedError";
import { InsufficientPrivilegeError } from "@/lib/errors/InsufficientPrivilegeError";

export const defaultAltHandler = (err: object): string | undefined => {
  if (check.instance(err, Error)) {
    if (err.name === UnauthenticatedError.name) {
      return "Cần đăng nhập"
    }

    if (err.name === InsufficientPrivilegeError.name) {
      return "Không đủ quyền hạn cho tác vụ"
    }

    // extend more in the future idk
  }

  if (check.containsKey(err, "status")) {
    const fbq = (err as FetchBaseQueryError)

    if (check.number(fbq.status)) {
      switch (fbq.status) {
        case 500:
          return "Lỗi hệ thống"

        case 400:
          return "Dữ liệu không hợp lệ"

        case 404:
          return "Không tìm thấy tài nguyên"

        case 403:
          return "Không được phép truy cập"

        default:
          return "Lỗi truy cập"
      }
    }

    if (check.string(fbq.status)) {
      switch (fbq.status) {
        case "FETCH_ERROR":
          return "Không thể lấy dữ liệu"

        case "TIMEOUT_ERROR":
          return "Kết nối quá thời gian"

        case "PARSING_ERROR":
          return "Định dạng dữ liệu được trả về sai"

        case "CUSTOM_ERROR":
          return "Lỗi chưa định dạng"

        default:
          return "Lỗi truy cập"
      }
    }
  }

  return undefined
}

export const tryGetApiErrorMsg = (error?: Error | FetchBaseQueryError | SerializedError, altHandler?: ((err: object) => string | undefined) | false) => {
  if (!check.object(error)) {
    return undefined;
  }

  try {
    const errMsg = (error as { data?: { message?: string } }).data?.message

    if (altHandler) {
      const altMsg = altHandler(error)

      if (!altMsg) {
        deverror("API error handler function: Alt handler returned undefined, which is considered as missing handle case.", error)
      }

      return altMsg
    }

    if (!check.undefined(errMsg)) return errMsg;

    if (!altHandler) {
      if (check.undefined(altHandler)) {
        deverror("API error handler function: Api slice returned an error that doesn't follow conventional error with message format, consider adding a handler function in the future.", error)
      }
      return undefined
    }

  }
  catch (e) {
    if (!altHandler) {
      deverror("API error handler function: Type error.", e)
      return undefined
    }
  }
}
