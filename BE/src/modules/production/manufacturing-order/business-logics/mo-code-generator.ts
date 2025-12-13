import check from "check-types";
import { manufacturingOrderCodePattern } from "./mo-code-pattern";

export class MOCodeGenerator {
  lastOrderSequenceNumber: number;
  lastOrderMonth: number;
  currentMonth: number;

  getCode(index: number) {
    return `${this.currentMonth == this.lastOrderMonth
        ? this.lastOrderSequenceNumber + index + 1
        : index + 1
      }/${this.currentMonth < 10 ? "0" : ""}${this.currentMonth}`;
  }

  incrementCode() {
    this.lastOrderSequenceNumber += 1;
    return this.getCode(0);
  }

  constructor(lastOrderCode?: string) {
    if (check.string(lastOrderCode)) {
      if (!manufacturingOrderCodePattern.test(lastOrderCode)) {
        throw new Error(
          "MOCodeGenerator must be given the valid code of the latest MO in the system",
        );
      }
      const [sequenceNumber, month] = lastOrderCode.split("/");
      this.lastOrderSequenceNumber = parseInt(sequenceNumber);
      this.lastOrderMonth = parseInt(month);
    } else {
      this.lastOrderSequenceNumber = 0;
      this.lastOrderMonth = 0;
    }

    const d = new Date();
    this.currentMonth = d.getMonth() + 1;
  }
}
