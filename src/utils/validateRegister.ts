import { RegisterInput } from "../resolvers/registerInput";

export const validateRegister = (options: RegisterInput) => {
  if (!options.email.includes("@")) {
    return [{ field: "email", message: "not a valid email" }];
  }
  if (options.username.length <= 2) {
    return [{ field: "username", message: "length must be greater than 2" }];
  }

  if (options.password.length <= 4) {
    return [{ field: "password", message: "length must be greater than 4" }];
  }
  if (options.username.includes("@")) {
    return [{ field: "username", message: "cannot include @ sign" }];
  }
  return null;
};
