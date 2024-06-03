import { Api } from "./api";

const resource = "interviews";

const interviews = {
  getInterviewsByDates: async (
    startDate: string,
    endDate: string,
    accessToken: string | undefined
  ) => {
    return await Api.get(
      `${resource}?startDate=${startDate}&endDate=${endDate}}`,
      accessToken
    );
  },
  getInterviewsByDate: async (
    date: string,
    accessToken: string | undefined
  ) => {
    return await Api.get(`${resource}?date=${date}`, accessToken);
  },
};

export default interviews;
