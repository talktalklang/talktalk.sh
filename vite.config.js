import { defineConfig } from "vite";
import util from "util";
import { exec as execSync } from "child_process";
import fs from "fs/promises";
import path from "path";
const exec = util.promisify(execSync);

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
        console.log("replacing " + name);

        const { stdout } = await exec(
          "/Users/nakajima/apps/talktalk/.build/debug/talk html " +
            "src/code/" +
            name +
            ".talk"
        );

        const content = await fs.readFile(
          "src/code/" + name + ".talk",
          "utf-8"
        );

        return stdout;
      });
    },
  };
};

export default defineConfig({
  // Your configuration goes here
  plugins: [syntaxHighlightPlugin()],
});
