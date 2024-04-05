import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

import { z } from "zod";

import knex from "../../database/knex";

import { randomUUID } from "node:crypto";
import { compare, hash } from "bcryptjs"

export async function userRoutes(app: FastifyInstance) {
  app.post("/", async (request: FastifyRequest, reply: FastifyReply) => {
    const createUserSchema = z.object({
      name: z.string(),

      email: z.string(),
      password: z.string(),
    });

    const { name, email, password } = createUserSchema.parse(request.body);

    const emailAlreadyInUse = await knex("users").where({ email }).first();
    if (emailAlreadyInUse) {
      return reply.status(400).send({
        status: "error",
        message: "Email already in use!",
      })
    }

    const hashedPassword = await hash(password, 7);

    await knex("users").insert({
      id: randomUUID(),

      name,
      email,
      password: hashedPassword,
    })

    return reply.status(201).send();
  });

  app.post("/signin", async (request: FastifyRequest, reply: FastifyReply) => {
    const signInSchema = z.object({
      email: z.string(),
      password: z.string(),
    });

    const { email, password } = signInSchema.parse(request.body);

    const user = await knex("users").where({ email }).first();
    if (!user) {
      return reply.status(400).send({ 
        status: "error",
        message: "Email/Password incorrect!",
      })
    };

    const passwordMatch = await compare(password, user.password);
    if (!passwordMatch) {
      return reply.status(400).send({ 
        status: "error",
        message: "Email/Password incorrect!",
      })
    };

    const sessionId = randomUUID();
    reply.setCookie("sessionId", sessionId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    await knex("users").where({ email }).update({
      session_id: sessionId,
    });

    return reply.status(200).send({
      status: "success",
      message: "User authenticated successfully",
    })
  })
}