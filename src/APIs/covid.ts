import axios from "axios";

//documentation @https://covidtracking.com/data/api
//feel free to add more functions!

const covid = {
  getCurrentCovidStats: async () => {
    try {
      const response = await axios.get(
        "https://api.covidtracking.com/v1/states/current.json"
      );
      return response.data.results;
    } catch (error) {
      return error;
    }
  },
  getHistoricDailyCovidStats: async () => {
    try {
      const response = await axios.get(
        "https://api.covidtracking.com/v1/states/daily.json"
      );
      return response.data.results;
    } catch (error) {
      return error;
    }
  }
};

export default covid;
