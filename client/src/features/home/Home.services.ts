import { ENDPOINTS } from "../../api/endpoints";
import { HomepageData } from "./Home.types";
import { apiClient } from "../../api/base";


export const getHomepageData = async (): Promise<HomepageData> => {
    const response = await apiClient({
      method: "GET",
      endpoint: ENDPOINTS.Homepage.Get,
    });
    return response as HomepageData;
  }

  
