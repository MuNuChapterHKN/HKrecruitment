import { Api } from "./api";

const resource = "timeslots";

const timeslots = {
  getApplicants: async () => {
    return await Api.get(`${resource}`);
  },
};

export default timeslots;
