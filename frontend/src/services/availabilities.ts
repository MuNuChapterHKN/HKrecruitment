import { Api } from "./api";

const availabilities = {
  getAvailabilities: async () => {
    return await Api.get("availabilities");
  },
};

export default availabilities;
