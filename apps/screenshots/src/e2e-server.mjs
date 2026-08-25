import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRuntimeConfig } from "../../server/dist/config.js";
import { createPlanningPokerServer } from "../../server/dist/server.js";

const host = "127.0.0.1";
const port = 4174;
const sourceDirectory = path.dirname(fileURLToPath(import.meta.url));
const webDistDirectory = path.resolve(sourceDirectory, "../../web/dist");
const indexPath = path.join(webDistDirectory, "index.html");
const config = {
  ...loadRuntimeConfig({}),
  host,
  port,
  allowedOrigins: [`http://${host}:${port}`],
  cleanupIntervalMs: 60_000,
};
const server = createPlanningPokerServer({ config });

server.app.use(express.static(webDistDirectory, { index: false }));
server.app.use((request, response, next) => {
  if (request.path === "/" || request.path.startsWith("/socket.io")) {
    next();
    return;
  }
  response.sendFile(indexPath);
});

let stopping = false;
const shutdown = async () => {
  if (stopping) return;
  stopping = true;
  await server.stop();
  process.exit(0);
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

const address = await server.start();
console.log(
  `PP-010 real-stack server listening on http://${address.host}:${address.port}`,
);
