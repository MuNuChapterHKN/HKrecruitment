import { Api } from "./api";

const resource = "availabilities";

const availabilities = {
  getAvailabilities: async () => {
    return await Api.get(`${resource}`);
  },
};

export default availabilities;
