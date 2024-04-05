import fastify from "fastify";

declare module "fastify" {
  export interface FastifyRequest {
    user: {
      id: string,

      name: string,
      email: string,
      password: string,

      session_id: string,
    }
  }
}