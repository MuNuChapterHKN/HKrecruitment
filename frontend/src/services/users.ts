import { Api } from "./api";

const users = {
  getUsers: async () => {
    return await Api.get("users");
  },
};

export default users;
