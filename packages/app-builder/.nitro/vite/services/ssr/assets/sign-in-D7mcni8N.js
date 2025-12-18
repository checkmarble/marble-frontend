import { af as ErrorComponent } from "../server.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const SplitErrorComponent = ErrorComponent;
export {
  SplitErrorComponent as errorComponent
};
