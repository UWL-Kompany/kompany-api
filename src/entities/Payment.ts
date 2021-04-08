import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { GraphQLDate } from "graphql-iso-date";

//converting mikro-orm class into graphql types
@ObjectType()
@Entity()
//extend to baseEntity allows us to use .find() and .insert()
// there is another command that sets up repositories in type orm-- todo: find it out
export class Payment extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  cardholderName!: string;

  @Field(() => Int)
  @Column()
  longNumber!: string;

  @Field(() => GraphQLDate)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => GraphQLDate)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => GraphQLDate)
  @Column()
  expiration!: Date;
}
