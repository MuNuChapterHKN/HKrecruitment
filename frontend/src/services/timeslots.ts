import { Api } from "./api";

const timeslots = {
  getApplicants: async () => {
    return await Api.get("timeslots");
  },
};

export default timeslots;
