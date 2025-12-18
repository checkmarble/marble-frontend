import { aa as toDate } from "./services-middleware-DR8Hua1Y.js";
function endOfDay(date, options) {
  const _date = toDate(date, options?.in);
  _date.setHours(23, 59, 59, 999);
  return _date;
}
export {
  endOfDay as e
};
