import { o as object, s as string, _ as _enum } from "./short-uuid-MIi3jWzx.js";
const COOKIE_NAME = "u-prefs";
function isValidTimezone(timezone) {
  try {
    Intl.DateTimeFormat(void 0, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}
const timezoneSchema = string().refine(isValidTimezone, { message: "Invalid IANA timezone identifier" });
const themeSchema = _enum(["light", "dark"]);
const PreferencesCookieSchema = object({
  favInbox: string().optional(),
  timezone: timezoneSchema.optional(),
  theme: themeSchema.optional()
});
export {
  COOKIE_NAME as C,
  PreferencesCookieSchema as P
};
