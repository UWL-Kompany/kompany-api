import { Field, InputType } from "type-graphql";

//todo: rework UsernamePasswordInput to be RegisterInput
@InputType()
export class RegisterInput {
  @Field()
  email: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  address: string;

  @Field()
  username: string;
  @Field()
  password: string;
}
