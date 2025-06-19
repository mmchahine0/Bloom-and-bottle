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

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

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

  const makeRequest = async (token?: string) => {
    const requestHeaders = { ...headers };
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }

    const options = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: requestHeaders,
      params,
      data: isFormData ? data : JSON.stringify(data),
    };

    return axios(options);
  };

  try {
    const response = await makeRequest(accessToken);
    return response.data;
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      (error.response.data as { message: string }).message.includes(
        "Unauthorized: Token has expired"
      )
    ) {
      
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          return makeRequest(token as string).then(response => response.data);
        }).catch((err) => {
          throw err;
        });
      }

      isRefreshing = true;

      try {
        const { id: userId } = store.getState().auth;

        const response = await axios.post(
          `${BASE_URL}${ENDPOINTS.Auth.RefreshToken}`,
          {},
          { withCredentials: true }
        );

        const { accessToken: newAccessToken } = response.data.data;

        // Update the store with new token
        store.dispatch(
          setCredentials({
            accessToken: newAccessToken,
            id: userId,
            _initialized: true,
          })
        );

        // Process queued requests
        processQueue(null, newAccessToken);
        
        // Retry the original request with new token
        const retryResponse = await makeRequest(newAccessToken);
        return retryResponse.data;

      } catch (refreshError) {
        console.error("Refresh token error:", {
          error: refreshError,
          message: axios.isAxiosError(refreshError) ? refreshError.message : 'Unknown error',
          response: axios.isAxiosError(refreshError) ? refreshError.response?.data : null,
          status: axios.isAxiosError(refreshError) ? refreshError.response?.status : null
        });
        
        // Process queued requests with error
        processQueue(refreshError, null);
        
        // Clear user session
        store.dispatch(clearCredentials());
        store.dispatch(clearUserData());
        
        // Redirect to login
        window.location.href = '/auth/login';
        
        throw refreshError;
      } finally {
        isRefreshing = false;
      }
    }
    
    // Enhanced error logging for other errors
    if (axios.isAxiosError(error)) {
      const errorResponse = error.response?.data;
      const errorDetails = {
        request: {
          method: method,
          url: `${BASE_URL}${endpoint}`,
          headers,
          data: isFormData ? "[FormData]" : data,
          params
        },
        response: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: errorResponse,
          headers: error.response?.headers
        },
        error: {
          message: error.message,
          code: error.code,
          name: error.name
        },
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
};