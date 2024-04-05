import { DoneFuncWithErrOrRes, FastifyReply, FastifyRequest } from "fastify";

import knex from "../../database/knex";

export async function ensureUserAuthenticated(request: FastifyRequest, reply: FastifyReply, done: DoneFuncWithErrOrRes) {
  const sessionId = request.cookies.sessionId;

  if (!sessionId) {
    return reply.status(401).send({
      status: "error",
      message: "Unathorized! Has to have a sessionId cookie to access this route!",
    });
  };

  const user = await knex("users").where({ session_id: sessionId }).first();
  if (!user) {
    return reply.status(401).send({
      status: "error",
      message: "Unathorized! This sessionId cookie is not valid!",
    });
  };

  request.user = user;

  done();
} 