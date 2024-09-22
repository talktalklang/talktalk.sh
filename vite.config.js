import { defineConfig } from "vite";
import fs from "fs/promises";
import react from "@vitejs/plugin-react";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";

async function replaceAsync(str, regex, asyncReplacer) {
  // Find all matches of the regex in the string
  const matches = [];
  str.replace(regex, (...args) => {
    matches.push(args);
    return args[0]; // Return the match, no need to modify anything here
  });

  // Process each match asynchronously using the asyncReplacer
  const replacements = await Promise.all(
    matches.map(async (match) => {
      // args passed to the replacer function:
      // match[0] is the full match, match[1...] are the capture groups, match[match.length-2] is the index, match[match.length-1] is the input string
      return asyncReplacer(...match);
    })
  );

  // Replace the original string with the results from the async replacer
  let result = "";
  let lastIndex = 0;
  matches.forEach((match, index) => {
    const matchStartIndex = match[match.length - 2];
    result += str.slice(lastIndex, matchStartIndex); // Add string before the match
    result += replacements[index]; // Add the async replacement
    lastIndex = matchStartIndex + match[0].length; // Move past the match
  });

  result += str.slice(lastIndex); // Add any remaining part of the original string
  return result;
}

const syntaxHighlightPlugin = () => {
  return {
    name: "syntax-highlight",
    transformIndexHtml(html) {
      return replaceAsync(html, /CODE\((.*?)\.talk\)/g, async (_, name) => {
        const content = await fs.readFile(
          "src/code/" + name + ".talk",
          "utf-8"
        );

        return content;
      });
    },
  };
};

export default defineConfig({
  // Your configuration goes here
  plugins: [
    react(),
    new NodeGlobalsPolyfillPlugin({
      buffer: true,
    }),
    syntaxHighlightPlugin(),
  ],
});
