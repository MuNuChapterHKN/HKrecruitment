import { Api } from "./api";

const resource = "availabilities";

const availabilities = {
  getAvailabilities: async (accessToken: string | undefined) => {
    return await Api.get(`${resource}`, accessToken);
  },
};

export default availabilities;
