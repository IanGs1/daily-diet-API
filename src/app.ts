import fastify from "fastify";
import cookies from "@fastify/cookie";

import { userRoutes } from "./routes/user";

export const app = fastify();

app.register(cookies);

app.register(userRoutes, {
  prefix: "/users",
})