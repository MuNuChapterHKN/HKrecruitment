import { Api } from "./api";

const applications = {
  getApplications: async () => {
    return await Api.get("applications");
  },
};

export default applications;
