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

  app.get("/:mealId", async (request: FastifyRequest, reply: FastifyReply) => {
    const showAMealSchema = z.object({
      mealId: z.string(),
    })
    
    const userSessionId = request.cookies.sessionId;
    const { mealId } = showAMealSchema.parse(request.params);

    const user = await knex("users").where({ session_id: userSessionId }).first();
    if (!user) {
      return reply.status(400).send({
        status: "error",
        message: "sessionId cookie not valid!",
      })
    };

    const meal = await knex("meals").where({ id: mealId, user_id: user.id }).first();
    if (!meal) {
      return reply.status(400).send({
        status: "error",
        message: "mealId not valid!",
      })
    }

    return reply.status(200).send({
      meal,
    })
  });

  app.put("/:mealId", async (request: FastifyRequest, reply: FastifyReply) => {
    const mealIdParamSchema = z.object({
      mealId: z.string(),
    });

    const updateMealSchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),

      is_in_the_diet: z.boolean().optional(),
    });

    const { mealId } = mealIdParamSchema.parse(request.params);
    const { name, description, is_in_the_diet } = updateMealSchema.parse(request.body);

    const meal = await knex("meals").where({ id: mealId }).first();
    if (!meal) {
      return reply.status(400).send({
        status: "error",
        message: "mealId not valid!",
      })
    };

    meal.name = name ?? meal.name;
    meal.description = description ?? meal.description;
    meal.is_in_the_diet = is_in_the_diet ?? meal.is_in_the_diet;

    const newMeal = await knex("meals")
      .where({ id: meal.id })
      .update(meal)
      .returning("*");

    return reply.status(200).send({
      meal: newMeal,
    })
  });

  app.get("/metrics", async (request: FastifyRequest, reply: FastifyReply) => {
    const userSessionId = request.cookies.sessionId;

    const user = await knex("users").where({ session_id: userSessionId }).first();
    if (!user) {
      return reply.status(400).send({
        status: "error",
        message: "sessionId cookie not valid!",
      })
    };

    const meals = await knex("meals").where({ user_id: user.id });

    const totalMealsRegistered = meals.length;
    const totalMealsOnDiet = meals.filter(meal => meal.is_in_the_diet).length;
    const totalMealsOutOfDiet = totalMealsRegistered - totalMealsOnDiet;

    let i = 0;
    const allStreaksFromMealsOnDiet: Array<number> = [];

    meals.forEach((meal, mealIndex) => {
      if (meals[mealIndex + 1] !== undefined) {
        if (meal.is_in_the_diet && meals[mealIndex + 1].is_in_the_diet) {
          i++

          allStreaksFromMealsOnDiet.push(i + 1);
        } else if (!meal.is_in_the_diet || !meals[mealIndex + 1].is_in_the_diet) {
          i = 0;
        }
      }
    });

    const bestStreakFromMealsOnDiet = Math.max(...allStreaksFromMealsOnDiet);

    return reply.status(200).send({
      totalMealsRegistered,
      totalMealsOnDiet,
      totalMealsOutOfDiet,

      bestStreakFromMealsOnDiet,
    })
  })

  app.delete("/:mealId", async (request: FastifyRequest, reply: FastifyReply) => {
    const showAMealSchema = z.object({
      mealId: z.string(),
    })
    
    const userSessionId = request.cookies.sessionId;
    const { mealId } = showAMealSchema.parse(request.params);

    const user = await knex("users").where({ session_id: userSessionId }).first();
    if (!user) {
      return reply.status(400).send({
        status: "error",
        message: "sessionId cookie not valid!",
      })
    };

    const mealIsValid = await knex("meals").where({ id: mealId }).first();
    if (!mealIsValid) {
      return reply.status(400).send({
        status: "error",
        message: "mealId not valid!",
      })
    }

    await knex("meals").where({ id: mealId, user_id: user.id }).delete();

    return reply.status(204).send()
  });
}