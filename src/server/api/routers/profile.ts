import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";

export const profileRouter = createTRPCRouter({
  getUserByUsername: protectedProcedure
  .input(z.object({ name: z.string()}))
  .query(async ({ ctx, input }) => {
    const user = await ctx.db.user.findFirst({ where: { name: input.name }})

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found!"})
    }

    return user;
  })

})