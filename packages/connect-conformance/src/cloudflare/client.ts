// Copyright 2021-2024 The Connect Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {
  ClientCompatRequest,
  ClientCompatResponse,
  ClientErrorResult,
} from "../gen/connectrpc/conformance/v1/client_compat_pb.js";
import type { ReadStream } from "node:tty";
import {
  createConnectTransport,
  createGrpcTransport,
  createGrpcWebTransport,
} from "@connectrpc/connect-node";
import { createPromiseClient } from "@connectrpc/connect";
import type { Transport } from "@connectrpc/connect";
import { InvokeService } from "./invoke-service.js";
import { parseArgs } from "node:util";

const { values: flags } = parseArgs({
  args: process.argv.slice(2),
  options: {
    protocol: {
      type: "string",
      default: "connect",
    },
  },
});

export async function run() {
  const workerUrl = `https://${process.env["CLOUDFLARE_WORKERS_CLIENT_HOST"]}/`;
  const transportOptions = { baseUrl: workerUrl, httpVersion: "2" } as const;
  let transport: Transport;
  switch (flags.protocol) {
    case "connect":
      transport = createConnectTransport(transportOptions);
      break;
    case "grpc":
      transport = createGrpcTransport(transportOptions);
      break;
    case "grpc-web":
      transport = createGrpcWebTransport(transportOptions);
      break;
    default:
      throw new Error(`Unknown protocol: ${flags.protocol}`);
  }
  const client = createPromiseClient(InvokeService, transport);
  for await (const next of readReqBuffers(process.stdin)) {
    const req = ClientCompatRequest.fromBinary(next);
    req.host = process.env["CLOUDFLARE_WORKERS_REFERENCE_SERVER_HOST"]!;
    let res = new ClientCompatResponse({
      testName: req.testName,
    });
    try {
      res = await client.invoke(req);
    } catch (e) {
      res.result = {
        case: "error",
        value: new ClientErrorResult({
          message: (e as Error).message,
        }),
      };
    }
    const resData = res.toBinary();
    const resSize = Buffer.alloc(4);
    resSize.writeUInt32BE(resData.length);
    process.stdout.write(resSize);
    process.stdout.write(resData);
  }
}

async function* readReqBuffers(stream: ReadStream) {
  stream.on("error", (err) => {
    throw err;
  });
  for (; !stream.readableEnded; ) {
    const size = stream.read(4) as Buffer | null;
    if (size === null) {
      await new Promise((resolve) => {
        stream.once("readable", resolve);
        stream.once("end", resolve);
      });
      continue;
    }
    let chunk: Buffer | null = null;
    // We are guaranteed to get the next chunk.
    for (;;) {
      chunk = stream.read(size.readUInt32BE()) as Buffer | null;
      if (chunk !== null) {
        break;
      }
      await new Promise((resolve) => stream.once("readable", resolve));
    }
    yield chunk;
  }
}
