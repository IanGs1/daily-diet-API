import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

import { z } from "zod";

import knex from "../../database/knex";

import { randomUUID } from "node:crypto";
import { ensureUserAuthenticated } from "../middlewares/ensure-user-authenticated";

export async function mealRoutes(app: FastifyInstance) {
  app.addHook("preHandler", ensureUserAuthenticated);

  app.post("/", async (request: FastifyRequest, reply: FastifyReply) => {
    const createMealSchema = z.object({
      name: z.string(),
      description: z.string(),

      is_in_the_diet: z.boolean(),
    });

    const { name, description, is_in_the_diet } = createMealSchema.parse(request.body);
    const userSessionId = request.cookies.sessionId;

    const user = await knex("users").where({ session_id: userSessionId }).first();
    if (!user) {
      return reply.status(400).send({
        status: "error",
        message: "sessionId cookie not valid!",
      })
    }

    const [meal] = await knex("meals").insert({
      id: randomUUID(),
      
      name,
      description,
      is_in_the_diet,

      user_id: user.id
    }).returning("*");

    return reply.status(201).send({
      meal,
    })
  });

  app.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
    const userSessionId = request.cookies.sessionId;

    const user = await knex("users").where({ session_id: userSessionId }).first();
    if (!user) {
      return reply.status(400).send({
        status: "error",
        message: "sessionId cookie not valid!",
      })
    };

    const meals = await knex("meals").where({ user_id: user.id });

    return reply.status(200).send({
      meals,
    })
  });
}