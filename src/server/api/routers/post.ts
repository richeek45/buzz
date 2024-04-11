import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1), content: z.string().emoji().min(1).max(280) }))
    .mutation(async ({ ctx, input }) => {
      // simulate a slow db call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return ctx.db.post.create({
        data: {
          name: input.name,
          content: input.content,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
    }),

  getAllPosts: protectedProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({ take: 100 });
    const userIds = posts.map(post => post.authorId)

    const users = await ctx.db.user.findMany({
      where: {
        id: {
          in: userIds
        }
      }
    })

    return posts.map(post => {
      const author = users.find((user) => post.authorId === user.id);
      if (!author?.name) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Author for post not found'
        })
      }

      return ({
        post,
        author: {
          ...author,
          name: author.name
        }
      })
    });
    }),
  
  getLatest: protectedProcedure.query(({ ctx }) => {
    return ctx.db.post.findFirst({
      orderBy: { createdAt: "desc" },
      where: { createdBy: { id: ctx.session.user.id } },
    });
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
