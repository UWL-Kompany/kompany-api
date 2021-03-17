import { Post } from "../entities/Post";
import {
  Arg,
  Query,
  Resolver,
  Mutation,
  InputType,
  Field,
  Ctx,
  UseMiddleware,
} from "type-graphql";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@Resolver()
export class PostResvoler {
  @Query(() => [Post])
  async posts(): Promise<Post[]> {
    return Post.find();
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id") id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({
      ...input,
      creatorId: req.session.userId,
    }).save();
  }
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await Post.findOne(id); // Post.findOne(id) is shorthand for Post.findOne({where: {id}})
    if (!post) {
      return null;
    }
    if (typeof title !== undefined) {
      post.title = title;
      Post.update({ id }, { title });
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg("id") id: number): Promise<Boolean> {
    await Post.delete(id);
    return true;
  }
}
