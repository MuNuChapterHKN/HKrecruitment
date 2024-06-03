import { Api } from "./api";

const resource = "recruitment-session";

const recruitmentSessions = {
  getActive: async () => {
    return await Api.get(`${resource}`);
  },
};

export default recruitmentSessions;
