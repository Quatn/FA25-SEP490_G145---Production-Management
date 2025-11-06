import { Injectable } from "@nestjs/common";
import check from "check-types";
import { JwtPayload } from "./common/interfaces/jwt-payload.interface";

@Injectable()
export class AppService {
  getWelcomeMessage(user: JwtPayload | undefined): string {
    if (check.undefined(user)) {
      return "Welcome to Xuan Cau ERP, your authentication status is: Guest/Unauthenticated";
    }
    return "Welcome to Xuan Cau ERP, your authentication status is: Authenticated";
  }
}
