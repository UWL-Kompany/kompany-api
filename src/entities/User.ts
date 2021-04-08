import { GraphQLDate } from "graphql-iso-date";
import { Field, ObjectType } from "type-graphql";
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
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true })
  username!: string;

  @Field()
  @Column()
  firstName!: string;

  @Field()
  @Column()
  lastName!: string;

  @Field()
  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Field()
  @Column()
  address!: string;

  @Column({ type: "int" })
  isAdmin!: number;

  @Field(() => GraphQLDate)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => GraphQLDate)
  @UpdateDateColumn()
  updatedAt: Date;
}
