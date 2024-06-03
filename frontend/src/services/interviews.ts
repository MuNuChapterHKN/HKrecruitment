import { Api } from "./api";

const resource = "interviews";

const interviews = {
  getInterviewsByDates: async (startDate: string, endDate: string) => {
    return await Api.get(
      `${resource}?startDate=${startDate}&endDate=${endDate}}`
    );
  },
  getInterviewsByDate: async (date: string) => {
    return await Api.get(`${resource}?date=${date}`);
  },
};

export default interviews;
