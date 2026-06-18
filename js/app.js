// Bootstrap. The menu reads the content manifest and routes by hash; choosing
// an exercise hands it to the generic engine. The exercises themselves still
// live entirely in JSON under /content.

import { start } from "./menu.js";
import { t } from "./i18n.js";

async function main() {
  document.getElementById("app-title").textContent = t("appTitle");
  document.title = t("appTitle");
  await start(document.getElementById("app"));
}

main().catch((err) => {
  document.getElementById("app").textContent = String(err);
  console.error(err);
});
