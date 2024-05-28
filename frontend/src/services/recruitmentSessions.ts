import { Api } from "./api";

const recruitmentSessions = {
  getActive: async () => {
    return await Api.get("recruitmentSessions");
  },
};

export default recruitmentSessions;
