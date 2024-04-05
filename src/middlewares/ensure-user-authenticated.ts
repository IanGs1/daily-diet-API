import { DoneFuncWithErrOrRes, FastifyReply, FastifyRequest } from "fastify";

export function ensureUserAuthenticated(request: FastifyRequest, reply: FastifyReply, done: DoneFuncWithErrOrRes) {
  const sessionId = request.cookies.sessionId;

  if (!sessionId) {
    return reply.status(401).send({
      status: "error",
      message: "Unathorized! Has to have a sessionId cookie to access this route!",
    });
  };

  done();
} 