import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
require("dotenv-safe").config();
import cors from "cors";
import express from "express";
import session from "express-session";
import Redis from "ioredis";
import path from "path";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import { COOKIE_NAME, __prod__ } from "./constants";
import { Order } from "./entities/Order";
import { Payment } from "./entities/Payment";
import { Product } from "./entities/Product";
import { User } from "./entities/User";
import { helloResolver } from "./resolvers/hello";
import { ProductResvoler } from "./resolvers/product";
import { UserResolver } from "./resolvers/user";
import { createUserLoader } from "./utils/createUserLoader";

//import { sendEmail } from "./utils/sendEmail";
//rerun
const main = async () => {
  //database connectivity using mikroorm
  const conn = await createConnection({
    type: "postgres",
    url: process.env.DATABASE_URL,
    logging: true,
    migrations: [path.join(__dirname, "./migrations/*")],
    //synchronize creates tables auto without migrations, useful for development
    // synchronize: true,
    entities: [User, Payment, Product, Order],
  });
  await conn.runMigrations();

  //server connectivity
  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis();
  //await Post.delete({});

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
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
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [helloResolver, ProductResvoler, UserResolver],
      validate: false,
    }),
    //context is a special object accessible to all resolvers
    context: ({ req, res }) => ({
      req,
      res,
      redis,
      userLoader: createUserLoader(),
    }),
  });

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(4000, () => console.log("server running on localhost:4000"));
};

main().catch((err) => {
  console.error(err);
});
