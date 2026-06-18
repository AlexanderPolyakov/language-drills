// Type registry. Each exercise `type` maps to one module exposing render(item)
// and check(item, input) (and an optional mark(body, result) to paint its own
// feedback). Registering a new type is a one-line change here — the engine
// needs no other change.

import * as cloze from "./cloze.js";
import * as transform from "./transform.js";

export const types = { cloze, transform };
