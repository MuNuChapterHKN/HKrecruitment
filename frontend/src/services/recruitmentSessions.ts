import { Api } from "./api";

const resource = "recruitment-session";

const recruitmentSessions = {
  getActive: async (accessToken: string | undefined) => {
    return await Api.get(`${resource}`, accessToken);
  },
};

export default recruitmentSessions;
