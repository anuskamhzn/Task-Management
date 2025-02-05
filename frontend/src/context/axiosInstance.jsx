import axios from 'axios';

const axiosInstance = axios.create();

// Request Interceptor to add the access token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');  // Access token in localStorage or state
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,  // Return the response as is if everything is okay
  async (error) => {
    if (error.response && error.response.status === 401) {  // Token expired
      try {
        const refreshResponse = await axios.post(`${process.env.REACT_APP_API}/api/auth/refresh-token`, {}, { withCredentials: true });
        const newAccessToken = refreshResponse.data.accessToken;

        // Store the new access token
        localStorage.setItem('accessToken', newAccessToken);

        // Retry the original request with the new access token
        error.config.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return axios(error.config);  // Retry the original request
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        // Redirect to login if refreshing fails
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);  // Reject the promise if not a 401
  }
);

export default axiosInstance;
