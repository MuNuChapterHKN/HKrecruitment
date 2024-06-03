import { Api } from "./api";

const resource = "users";

const users = {
  getUsers: async (accessToken: string | undefined) => {
    return await Api.get(`${resource}`, accessToken);
  },
};

export default users;
