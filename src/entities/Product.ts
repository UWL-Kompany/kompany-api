import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { GraphQLDate } from "graphql-iso-date";

@ObjectType()
@Entity()
export class Product extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  name!: string;

  @Field()
  @Column()
  description!: string;

  @Field()
  @Column()
  stock!: number;

  @Field(() => GraphQLDate)
  @Column()
  nextStock!: Date;

  @Field(() => GraphQLDate)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => GraphQLDate)
  @UpdateDateColumn()
  updatedAt: Date;
}
