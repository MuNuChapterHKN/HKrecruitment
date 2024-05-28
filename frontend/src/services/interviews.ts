import { Api } from "./api";

const interviews = {
  getInterviewsByDates: async (startDate: string, endDate: string) => {
    return await Api.get(
      `interviews?startDate=${startDate}&endDate=${endDate}}`
    );
  },
  getInterviewsByDate: async (date: string) => {
    return await Api.get(`interviews?date=${date}`);
  },
};

export default interviews;
