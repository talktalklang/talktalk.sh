import { Buffer } from "buffer";
(window as any).Buffer = Buffer;

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

const instance = await WebAssembly.instantiate(talk, wasmImportObject);

export async function execute(
  input: string
): Promise<{ stdout: string; stderr: string }> {
  let wasi = new WASI({
    env: {},
    args: ["talk", "run", "-"],
  });

  const wasmImportObject = {
    ...wasi.getImports(talk),
  };

  const instance = await WebAssembly.instantiate(talk, wasmImportObject);
  wasi.setStdinString(input);
  wasi.start(instance);
  let stdout = wasi.getStdoutString();
  let stderr = wasi.getStderrString();

  return { stdout, stderr };
}

export async function highlight(
  input: string
): Promise<{ stdout: string; stderr: string }> {
  let wasi = new WASI({
    env: {},
    args: ["talk", "html", "-"],
  });

  const wasmImportObject = {
    ...wasi.getImports(talk),
  };

  const instance = await WebAssembly.instantiate(talk, wasmImportObject);
  wasi.setStdinString(input);
  wasi.start(instance);
  let stdout = wasi.getStdoutString();
  let stderr = wasi.getStderrString();

  return { stdout, stderr };
}
