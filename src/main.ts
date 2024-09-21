import { Buffer } from "buffer";
(window as any).Buffer = Buffer;

import * as browser_wasi_shim from "@bjorn3/browser_wasi_shim";

import "./style.css";
import { lowerI64Imports } from "@wasmer/wasm-transformer";
import { init, WASI } from "@wasmer/wasi";
await init();

// Load the .wasm from the public dir
const talkresponse = await fetch("/talk.wasm");
const talkbuffer = await talkresponse.arrayBuffer();
const talkbin = new Uint8Array(talkbuffer);
const talklowered = await lowerI64Imports(talkbin);
const talk = await WebAssembly.compile(talklowered);

let wasi = new WASI({
  env: {},
  args: ["talk", "run", "-"],
});

const wasmImportObject = {
  ...wasi.getImports(talk),
};

// Instantiate the WASI module
try {
  console.log("instantiating");
  wasi.setStdinString(`print("hello world from here")`);

  const instance = await WebAssembly.instantiate(talk, wasmImportObject);

  // Run the start function
  let exitCode = wasi.start(instance);

  // const imports = wasi.instantiate(talk, wasmImportObject);
  // console.log(imports);

  let stdout = wasi.getStdoutString();
  let stderr = wasi.getStderrString();

  // This should print "hello world (exit code: 0)"
  console.log(`${stdout}(exit code: ${exitCode})\n${stderr}`);
} catch (e) {
  if (e instanceof WebAssembly.RuntimeError) {
    console.error(e);
    console.error(e.message);
    console.error(e.name);
    console.error(e.stack);
  } else {
    console.error(e);
  }
}
