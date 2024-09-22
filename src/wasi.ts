import { Buffer } from "buffer";
(window as any).Buffer = Buffer;

import { lowerI64Imports } from "@wasmer/wasm-transformer";
import { init, WASI } from "@wasmer/wasi";

// Global variable to store the compiled WebAssembly module
let talk: WebAssembly.Module | null = null;

// Function to initialize WebAssembly module
async function initTalk(): Promise<WebAssembly.Module> {
  if (talk === null) {
    // Initialize WASI if not done yet
    await init();

    // Load the .wasm from the public dir
    const talkresponse = await fetch("/talk.wasm.gzip");

    const responseBlob = await talkresponse.blob();
    const decompressionStream = new DecompressionStream("gzip");
    const decompressedArrayBuffer = await new Response(
      responseBlob.stream().pipeThrough(decompressionStream)
    ).arrayBuffer();

    const talkbin = new Uint8Array(decompressedArrayBuffer);
    const talklowered = await lowerI64Imports(talkbin);

    // Compile the WebAssembly module and store it globally
    talk = await WebAssembly.compile(talklowered);
  }

  return talk;
}

export async function execute(
  input: string
): Promise<{ stdout: string; stderr: string }> {
  const talk = await initTalk();

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
  const talk = await initTalk();

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
