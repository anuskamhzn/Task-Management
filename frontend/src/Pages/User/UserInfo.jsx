import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/auth'; 
import Navbar from '../../Components/Navbar';

const UserInfo = () => {
  const [auth] = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!auth.token) {
        return;
      }

      try {
        const response = await axios.get(`${process.env.REACT_APP_API}/api/auth/user-info`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });

        setUser(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [auth.token]);

  if (!auth.token) return <p className="text-gray-500">Loading authentication...</p>;
  if (loading) return <p className="text-gray-500">Loading user info...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">User Info</h1>
        <div className="space-y-3">
          <p><strong className="font-medium text-gray-700">Name:</strong> <span className="text-gray-900">{user.name}</span></p>
          <p><strong className="font-medium text-gray-700">Email:</strong> <span className="text-gray-900">{user.email}</span></p>
          <p><strong className="font-medium text-gray-700">Username:</strong> <span className="text-gray-900">{user.username}</span></p>
          <p><strong className="font-medium text-gray-700">Phone no.:</strong> <span className="text-gray-900">{user.phone}</span></p>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;