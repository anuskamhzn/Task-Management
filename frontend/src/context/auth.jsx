import { useState, useEffect, useContext, createContext } from "react";
import axios from 'axios';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    token: "",
    refreshToken: "", // Store the refresh token as well
  });

  // Update axios default authorization header whenever the token changes
  useEffect(() => {
    if (auth?.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [auth?.token]);

  useEffect(() => {
    const storedData = localStorage.getItem('auth');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setAuth({
        user: parsedData.user,
        token: parsedData.token,
        refreshToken: parsedData.refreshToken, 
      });
  
    }
  }, []);
  

  useEffect(() => {
    // Save auth data to localStorage whenever it changes
    if (auth.user && auth.token) {
      localStorage.setItem('auth', JSON.stringify(auth));
    } else {
      localStorage.removeItem('auth');
    }
  }, [auth]);  // Watch for changes in `auth`

    // Token expiration logic: check if token is expired and try to refresh it
    useEffect(() => {
      if (auth.token) {
        const tokenExpiration = JSON.parse(atob(auth.token.split('.')[1])).exp;
        const now = Math.floor(Date.now() / 1000); // Current time in seconds
  
        // If token is expired and refresh token exists, attempt to refresh it
        if (tokenExpiration < now && auth.refreshToken) {
          const refreshTokenRequest = async () => {
            try {
              const response = await axios.post('/api/auth/refresh', {
                refreshToken: auth.refreshToken,
              });
              const { token, refreshToken, user } = response.data;
  
              // Update auth context and localStorage with the new token and user
              setAuth({ user, token, refreshToken });
            } catch (error) {
              console.error("Error refreshing token", error);
              // Optionally log the user out if refresh token is invalid
              setAuth({ user: null, token: "", refreshToken: "" });
              localStorage.removeItem('auth');
            }
          };
  
          refreshTokenRequest();
        }
      }
    }, [auth.token, auth.refreshToken]);

  return (
    <AuthContext.Provider value={[auth, setAuth]}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access auth context
const useAuth = () => useContext(AuthContext);

export { useAuth, AuthProvider };
