import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

import { Ratelimit } from "@upstash/ratelimit"; 
import { Redis } from "@upstash/redis";

// Create a new ratelimiter, that allows 3 requests per 1 minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */
  prefix: "@upstash/ratelimit",
});

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1), content: z.string().emoji({ message: "Only emojis are allowed!" }).min(1).max(280) }))
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.session.user.id;

      const { success } = await ratelimit.limit(authorId);

      if (!success) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS" })
      }

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
  
  getPostById: publicProcedure
  .input(z.object({ id: z.number() }))
  .query(async ({ ctx, input}) => {
    const post = await ctx.db.post.findFirst({ where: { id: input.id }})
    const author = await ctx.db.user.findFirst({ where: { id: post?.authorId }})

    if(!post || !author?.name) {
      throw new TRPCError({ code: "NOT_FOUND", message: "post not found!"});
    }

    return {
      post,
      author: {
        ...author,
        name: author.name
      }
    };
  }),

  getPostsByUserId: publicProcedure.input(z.object({ userId: z.string()})).query(async ({ ctx, input}) => {
    const userWithPosts = await ctx.db.user.findFirst({ where: {id: input.userId }, include: { posts: true }})

    if (!userWithPosts?.name) {
      throw new TRPCError({ code: "NOT_FOUND", message: "user with post not found!" })
    }

    const author = {
      id: userWithPosts?.id,
      name: userWithPosts.name,
      email: userWithPosts?.email,
      emailVerified: userWithPosts?.emailVerified,
      image: userWithPosts?.image
    }
    const postWithUserInfo = userWithPosts?.posts.map(post => {
      return ({
        post,
        author: {
          ...author,
          id: userWithPosts.id,
          email: userWithPosts.email,
        }
      })
    })

    return postWithUserInfo;
  }),

  getAllPosts: protectedProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({ 
      take: 100,
      orderBy: [{ createdAt: "desc" }] 
    });
    const userIds = posts.map(post => post.authorId)

    const users = await ctx.db.user.findMany({
      where: {
        id: {
          in: userIds
        }
      },
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
