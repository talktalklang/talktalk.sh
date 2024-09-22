import React, { useState, useEffect, useRef } from "react";
import classnames from "classnames";
import { createRoot } from "react-dom/client";
import Editor from "react-simple-code-editor";
import { highlight, execute } from "./wasi";

function App({ initial }: { initial: string }) {
  // Get the output element so we can scroll to it
  const outputRef = useRef<HTMLDivElement>(null);

  // Whether or not we're executing
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // The code being edited
  const [code, setCode] = useState(initial);

  // The syntax highlighted output
  const [highlightedCode, setHighlightedCode] = useState(code);

  // The result output of the script
  const [output, setOutput] = useState<string | null>(null);

  // Effect to highlight code when `code` changes
  useEffect(() => {
    async function updateHighlightedCode() {
      const result = await highlight(code); // Await the async highlight function

      setHighlightedCode(result.stdout); // Update the highlighted code in state
    }

    updateHighlightedCode();
  }, [code]); // Dependency array ensures the effect runs when `code` changes

  // Make the run function asynchronous
  async function run() {
    try {
      setIsRunning(true);
      const result = await execute(code); // Execute the code asynchronously
      setOutput(result.stdout); // Set the output to display the result

      setTimeout(() => {
        setIsRunning(false);
        outputRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 10);
    } catch (error) {
      setOutput("Execution failed.");
    }
  }

  return (
    <div className="col-span-2">
      <div className="relative font-mono shadow-sm bg-zinc-100 dark:bg-gray-900 p-3">
        <button
          className={classnames(
            "px-3 py-1 bg-yellow-100 dark:bg-slate-800 float-right",
            {
              "opacity-50": isRunning,
            }
          )}
          onClick={run}
          disabled={isRunning}
        >
          Run
        </button>
        <Editor
          tabSize={1}
          insertSpaces={false}
          value={code}
          onValueChange={(code) => setCode(code)}
          highlight={(_) => highlightedCode}
        />
      </div>
      {output && (
        <div
          ref={outputRef}
          className="p-3 dark:bg-gray-800 bg-slate-100 font-mono"
        >
          <h3 className="text-gray-500">Output</h3>
          <pre>{output}</pre>
        </div>
      )}
    </div>
  );
}

for (const editor of document.querySelectorAll(".js-code")) {
  const code = editor.textContent || "";
  const container = editor.closest(".js-run-container");
  const root = createRoot(container!);

  root.render(<App initial={code}></App>);
}
