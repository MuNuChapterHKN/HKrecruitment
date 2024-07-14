import { Api } from "./api";

const resource = "timeslots";

const timeslots = {
  getApplicants: async (accessToken: string | undefined) => {
    return await Api.get(`${resource}`, accessToken);
  },
};

export default timeslots;
