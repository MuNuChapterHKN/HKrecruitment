import { Api } from "./api";

const resource = "users";

const users = {
  getUsers: async () => {
    return await Api.get(`${resource}`);
  },
};

export default users;
