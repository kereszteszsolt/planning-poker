import { loadRuntimeConfig } from "./config.js";
import { createPlanningPokerServer } from "./server.js";

const server = createPlanningPokerServer({ config: loadRuntimeConfig() });

server.start().then(({ host, port }) => {
  console.log(`Planning Poker server listening on http://${host}:${port}`);
});

const shutdown = async () => {
  await server.stop();
  process.exit(0);
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
