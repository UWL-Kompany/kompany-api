import { Product } from "../entities/Product";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";
import { GraphQLDate } from "graphql-iso-date";

@InputType()
class ProductInput {
  @Field()
  name: string;
  @Field()
  description: string;
  @Field()
  stock: number;

  @Field(() => GraphQLDate)
  nextStock: Date;
}

@ObjectType()
class PaginatedProducts {
  @Field(() => [Product])
  products: Product[];
  @Field()
  hasMore: boolean;
}

@Resolver(Product)
export class ProductResvoler {
  @Query(() => PaginatedProducts)
  async products(
    //2 types of pagination, offset or curser based
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null, //date of new posts
    @Ctx() {}: MyContext
  ): Promise<PaginatedProducts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const replacements: any[] = [realLimitPlusOne];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }
    const posts = await getConnection().query(
      `
      select p.*
      from product p
      ${cursor ? `where p."createdAt" < $2` : ""}
      order by p."createdAt" DESC
      limit $1
    `,
      replacements
    );

    return {
      products: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  @Query(() => Product, { nullable: true })
  product(@Arg("id", () => Int) id: number): Promise<Product | undefined> {
    return Product.findOne(id);
  }

  @Mutation(() => Product)
  @UseMiddleware(isAuth)
  async createProduct(
    @Arg("input") input: ProductInput,
    @Ctx() {}: MyContext
  ): Promise<Product> {
    return Product.create({
      ...input,
    }).save();
  }

  @Mutation(() => Product, { nullable: true })
  @UseMiddleware(isAuth)
  async updateProduct(
    @Arg("id", () => Int) id: number,
    @Arg("name", { nullable: true }) name: string,
    @Arg("description", { nullable: true }) description: string,
    @Arg("stock", () => Int, { nullable: true }) stock: number,
    @Ctx() {}: MyContext
  ): Promise<Product | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Product)
      .set({ name, description, stock })
      .where("id = :id ", {
        id,
      })
      .returning("*")
      .execute();
    console.log("result:  ", result);
    return result.raw[0];
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteProduct(
    @Arg("id", () => Int) id: number,
    @Ctx() {}: MyContext
  ): Promise<Boolean> {
    //not cascade method:
    // const post = await Post.findOne(id);
    // if (!post) {
    //   return false;
    // }
    // if (post?.creatorId !== req.session.userId) {
    //   throw new Error("not authorized");
    // }
    // await Updoot.delete({ postId: id });
    // await Post.delete({ id });

    await Product.delete({ id });
    return true;
  }
}
