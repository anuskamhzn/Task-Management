import { useState, useEffect, useContext, createContext } from "react";
import axios from 'axios';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const storedData = localStorage.getItem('auth');
    return storedData ? JSON.parse(storedData) : { user: null, token: "" };
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


  return (
    <AuthContext.Provider value={[auth, setAuth]}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access auth context
const useAuth = () => useContext(AuthContext);

export { useAuth, AuthProvider };