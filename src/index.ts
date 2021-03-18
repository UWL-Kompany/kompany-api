import "reflect-metadata";
import { COOKIE_NAME, __prod__ } from "./constants";
import { Post } from "./entities/Post";
import cors from "cors";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { helloResolver } from "./resolvers/hello";
import { PostResvoler } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import { MyContext } from "./types";
import { createConnection } from "typeorm";
import { User } from "./entities/User";
import path from "path";

//import { sendEmail } from "./utils/sendEmail";
//rerun
const main = async () => {
  //database connectivity using mikroorm
  const conn = await createConnection({
    type: "postgres",
    database: "kompany",
    username: "postgres",
    password: "Rubicon1999",
    logging: true,
    migrations: [path.join(__dirname, "./migrations/*")],
    //synchronize creates tables auto without migrations, useful for development
    synchronize: true,
    entities: [User, Post],
  });
  await conn.runMigrations();

  //server connectivity
  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis();
  //await Post.delete({});

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
        client: redis, //lets the session know we are using redis
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
    context: ({ req, res }): MyContext => ({ req, res, redis }),
  });

  apolloServer.applyMiddleware({ app, cors: false });

  //const posts = await Post.find();
  // console.log(posts);

  app.listen(4000, () => console.log("server running on localhost:4000"));
};

main().catch((err) => {
  console.error(err);
});
