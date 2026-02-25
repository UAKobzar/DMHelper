import Fastify from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import fastifyCors from "@fastify/cors";

import { config } from "./config";
import { loadModes } from "./services/modeService";
import { loadDataFiles } from "./services/dataService";
import { registerModesRoutes } from "./routes/modes";
import { registerDataRoutes } from "./routes/data";
import { registerChatRoutes } from "./routes/chat";
import { registerSettingsRoutes } from "./routes/settings";

const fastify = Fastify({
  logger: true,
});

async function start() {
  try {
    // Load modes and data files
    await loadModes();
    await loadDataFiles();

    // Register plugins
    await fastify.register(fastifyCors, {
      origin: true,
    });

    await fastify.register(fastifySwagger, {
      openapi: {
        info: {
          title: "DM Helper API",
          version: "1.0.0",
          description: "D&D Dungeon Master Helper API",
        },
        tags: [
          { name: "modes", description: "DM mode management" },
          { name: "data", description: "World context files" },
          { name: "chat", description: "LLM chat" },
          { name: "settings", description: "Runtime LLM configuration" },
        ],
      },
    });

    await fastify.register(fastifySwaggerUI, {
      routePrefix: "/api/docs",
    });

    // Register routes
    await registerModesRoutes(fastify);
    await registerDataRoutes(fastify);
    await registerChatRoutes(fastify);
    await registerSettingsRoutes(fastify);

    // Start server
    await fastify.listen({ port: config.PORT, host: "0.0.0.0" });
    console.log(`Server running at http://localhost:${config.PORT}`);
    console.log(`API docs at http://localhost:${config.PORT}/api/docs`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
