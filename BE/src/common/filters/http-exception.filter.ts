import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { BaseResponse } from "../dto/response.dto";
import { ErrorResponse } from "../dto/error.response.dto";
import check from "check-types";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    const body: BaseResponse<never, ErrorResponse<any>> = {
      success: false,
      message: "Internal server error",
    };

    if (process.env.NODE_ENV !== "production") {
      const err: ErrorResponse<string> = {
        message: "Unknown or unhandled error",
        status,
      };
      body.error = err;

      if (exception instanceof HttpException) {
        // If this is a known HttpException, extract info
        status = exception.getStatus();
        body.error.status = status;
        body.error.message = "No error message";
        const res = exception.getResponse();

        if (typeof res === "string") {
          body.message = res;
        } else if (check.containsKey(res, "message")) {
          body.message =
            (res as { message: string }).message ?? JSON.stringify(res);
        }

        // Additional handling
        if (status === HttpStatus.UNAUTHORIZED) {
          body.error.message = `Access denined for route ${response.req.url}`;
          let cookie_access_token: string | undefined = undefined;
          if (check.containsKey(response.req.cookies, "access_token")) {
            cookie_access_token = (
              response.req.cookies as { access_token: string }
            ).access_token;
          }
          body.error.stack = {
            cookie_access_token,
            authInfo: response.req.authInfo,
          };
        }
      } else if (exception instanceof Error) {
        body.error.message = exception.name;
        body.error.stack = exception.stack;
      }
    }

    response.status(status).json(body);
  }
}
