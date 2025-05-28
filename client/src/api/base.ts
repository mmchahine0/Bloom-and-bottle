import axios from "axios";
import { store } from "../redux/persist/persist";
import { clearCredentials, setCredentials } from "../redux/slices/authSlices";
import { clearUserData } from "../redux/slices/userSlice";
import { ENDPOINTS } from "../api/endpoints";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface ApiOptions {
  method: HttpMethod;
  endpoint: string;
  data?: unknown;
  accessToken?: string;
  params?: unknown;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

axios.defaults.withCredentials = true;

export const apiClient = async ({
  method,
  endpoint,
  data,
  params,
  accessToken,
}: ApiOptions): Promise<unknown> => {
  
  // Determine if we're sending FormData
  const isFormData = data instanceof FormData;
  
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const options = {
    method,
    url: `${BASE_URL}${endpoint}`,
    headers,
    params,
    data: isFormData ? data : JSON.stringify(data),
  };

  try {
    const response = await axios(options);
    return response.data;
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      (error.response.data as { message: string }).message.includes(
        "Unauthorized: Token has expired"
      )
    ) {
      try {
        const { id: userId } = store.getState().auth;

        const response = await axios.post(
          `${BASE_URL}${ENDPOINTS.Auth.RefreshToken}`,
          {},
          { withCredentials: true }
        );

        const { accessToken: newAccessToken } = response.data.data;

        store.dispatch(
          setCredentials({
            accessToken: newAccessToken,
            id: userId,
            _initialized: true,
          })
        );
        window.location.reload();
        return response.data;
      } catch (refreshError) {
        console.error("Refresh token error:", {
          error: refreshError,
          message: axios.isAxiosError(refreshError) ? refreshError.message : 'Unknown error',
          response: axios.isAxiosError(refreshError) ? refreshError.response?.data : null,
          status: axios.isAxiosError(refreshError) ? refreshError.response?.status : null
        });
        store.dispatch(clearCredentials());
        store.dispatch(clearUserData());
        throw refreshError;
      }
    }
    
    // Enhanced error logging
    if (axios.isAxiosError(error)) {
      const errorResponse = error.response?.data;
      const errorDetails = {
        // Request details
        request: {
          method: options.method,
          url: options.url,
          headers: options.headers,
          data: options.data,
          params: options.params
        },
        // Response details
        response: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: errorResponse,
          headers: error.response?.headers
        },
        // Error details
        error: {
          message: error.message,
          code: error.code,
          name: error.name
        },
        // Additional context
        context: {
          endpoint,
          timestamp: new Date().toISOString()
        }
      };

      console.error("API Error Details:", errorDetails);
      throw error;
    }

    // Handle non-Axios errors
    console.error("Non-Axios Error:", {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null,
      context: {
        endpoint,
        timestamp: new Date().toISOString()
      }
    });

    throw error;
  }
}