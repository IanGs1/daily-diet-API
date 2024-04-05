import fastify from "fastify";
import cookies from "@fastify/cookie";

import { userRoutes } from "./routes/user";
import { mealRoutes } from "./routes/meals";

export const app = fastify();

app.register(cookies);

app.register(userRoutes, {
  prefix: "/users",
});

app.register(mealRoutes, {
  prefix: "/meals",
})