import DataLoader from "dataloader";
import { User } from "../entities/User";
//eg:
//[1,7,8,9]
//user for each key
//[{id:1 , username: "Tim"}, {}]
export const createUserLoader = () =>
  new DataLoader<number, User>(async (userIds) => {
    const users = await User.findByIds(userIds as number[]);
    const userIdToUser: Record<number, User> = {};

    users.forEach((u) => {
      userIdToUser[u.id] = u;
    });
    const sortedUsers = userIds.map((userId) => userIdToUser[userId]);
    // console.log("userId: ", userIds);
    // console.log("map: ", userIdToUser);
    // console.log("sorted users: ", sortedUsers);
    return sortedUsers;
  });
