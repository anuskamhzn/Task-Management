import React, {useState} from 'react'
import "../../css/Style.css"
import axios from 'axios';
import { useAuth } from '../../context/auth';
import { useNavigate, NavLink } from 'react-router-dom'; 
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);  
  const navigate = useNavigate(); 
  
    // Access the auth context and setAuth function
    const [auth, setAuth] = useAuth();

    const handleSubmit = async (e) => {
      e.preventDefault();
  
      if (!email || !password) {
        toast.error('Please fill in both fields'); 
        return;
      }
  
      try {
        setLoading(true);  
  
        const response = await axios.post(
          `${process.env.REACT_APP_API}/api/auth/login`, 
          { email, password }
        );
  
        // If login is successful
        if (response.data.success) {
          const { token, user } = response.data; // assuming the response returns a token and user data
          setAuth({
            user,
            token,
          }); // Set user and token in the auth context and localStorage
          toast.success('Login successful!');
          setLoading(false);
          navigate('/dashboard');
        } else {
          setLoading(false);
          toast.error(response.data.message);
        }
      } catch (error) {
        setLoading(false);
        console.error(error);
        toast.error('Something went wrong. Please try again.');
      }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-3xl font-semibold text-center mb-6">Login</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="input-group">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Login
              </button>
            </form>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <NavLink
                to="/register" className="text-blue-600 hover:underline">Sign up</NavLink>
              </p>
            </div>
          </div>
        </div>
      );
      
}

export default Login
