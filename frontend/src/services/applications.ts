import { Api } from "./api";

const resource = "applications";

const applications = {
  getApplications: async (accessToken: string | undefined) => {
    return await Api.get(`${resource}`, accessToken);
  },
};

export default applications;
