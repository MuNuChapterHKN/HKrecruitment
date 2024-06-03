import { Api } from "./api";

const resource = "applications";

const applications = {
  getApplications: async () => {
    return await Api.get(`${resource}`);
  },
};

export default applications;
