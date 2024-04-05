import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

import { z } from "zod";

import knex from "../../database/knex";
import { ensureUserAuthenticated } from "../middlewares/ensure-user-authenticated";

export async function userRoutes(app: FastifyInstance) {
  app.addHook("preHandler", ensureUserAuthenticated);
}