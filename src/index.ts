import { MikroORM } from "@mikro-orm/core";
import "reflect-metadata";
import { COOKIE_NAME, __prod__ } from "./constants";
import { Post } from "./entities/Post";
import cors from "cors";
import microConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { helloResolver } from "./resolvers/hello";
import { PostResvoler } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import { MyContext } from "./types";
import { User } from "./entities/User";
//import { sendEmail } from "./utils/sendEmail";

const main = async () => {
  //database connectivity using mikroorm
  const orm = await MikroORM.init(microConfig);
  await orm.em.nativeDelete(User, {});
  orm.getMigrator().up();

  //server connectivity
  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,

      store: new RedisStore({
        client: redisClient, //lets the session know we are using redis
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //10 years
        httpOnly: true,
        sameSite: "lax", //protecting csrf
        secure: __prod__, //cookie only work in https, should or could be true in production,  but set to false in dev
      },
      secret: "quiouifsjfklj",
      resave: false,
      saveUninitialized: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [helloResolver, PostResvoler, UserResolver],
      validate: false,
    }),
    //context is a special object accessible to all resolvers
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res }),
  });

  apolloServer.applyMiddleware({ app, cors: false });

  const posts = await orm.em.find(Post, {});
  console.log(posts);

  app.listen(4000, () => console.log("server running on localhost:4000"));
};

main().catch((err) => {
  console.error(err);
});
