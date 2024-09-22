import { on } from "delegated-events";
import { execute } from "./wasi";
import "./editor";

import "./style.css";

on("click", ".js-run", async function (e) {
  e.preventDefault();

  if (!(e.target instanceof HTMLElement)) {
    return;
  }

  const container = e.target.closest(".js-run-container");
  const code = container?.querySelector(".js-code")?.textContent;

  if (!code) {
    return;
  }

  e.target.classList.add("opacity-50");

  const { stdout } = await execute(code);

  e.target.classList.remove("opacity-50");

  const result = container?.querySelector(".js-run-result");
  if (result) {
    result.innerHTML = resultOutput(stdout);
    result.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
});

function resultOutput(stdout: string): string {
  return `
    <div class="font-mono mt-3">
      <h4 class="text-gray-500">Result:</h4>
      <pre class="bg-gray-800 p-3">${stdout}</pre>
    </div>
  `;
}
