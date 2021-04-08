import { Arg, Ctx, Int, Mutation, Resolver, UseMiddleware } from "type-graphql";
import { getConnection } from "typeorm";
import { Order } from "../entities/Order";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";

@Resolver(Order)
export class OrderResolver {
  // make it so current user only sees their own orders

  @Mutation(() => Order)
  @UseMiddleware(isAuth)
  async createOrder(
    @Arg("status") status: string,
    @Arg("price") price: number,
    @Ctx() {}: MyContext
  ): Promise<Order> {
    return Order.create({
      status,
      price,
    }).save();
  }

  @Mutation(() => Order)
  @UseMiddleware(isAuth)
  async updateOrder(
    @Arg("id", () => Int) id: number,
    @Arg("status") status: string,
    @Arg("price") price: number,
    @Ctx() { req }: MyContext
  ): Promise<Order | null> {
    if (!req.session.userId) {
      return null;
    }
    const result = await getConnection()
      .createQueryBuilder()
      .update(Order)
      .set({ status, price })
      .where({ id })
      .returning("*")
      .execute();

    return result.raw[0];
  }
}
