import { isPossiblePhoneNumber } from "libphonenumber-js/min";
import { z } from "zod";

/** A full international number (E.164) that is possible for its country. */
export const phoneSchema = z.custom<string>(
  (v) => typeof v === "string" && isPossiblePhoneNumber(v),
  "Enter a valid phone number",
);
