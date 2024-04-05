import fastify from "fastify";
import { app } from "./app";

import env from "./env";

app.listen({
  port: env.PORT,
})
  .then(() => {
    console.log("HTTP server listening on: localhost:3333 🚀")
  })