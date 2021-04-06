import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

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

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => String)
  @Column()
  expiration!: Date;
}
