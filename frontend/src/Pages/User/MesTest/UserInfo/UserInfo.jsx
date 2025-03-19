import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/auth';
import axios from 'axios';

const UserInfom = ({ userId }) => {
  const [auth] = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!auth.token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      try {
        const endpoint = userId
          ? `${process.env.REACT_APP_API}/api/auth/user-info/${userId}`
          : `${process.env.REACT_APP_API}/api/auth/user-info`;

        const response = await axios.get(endpoint, {
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
  }, [auth.token, userId]);

  return (
    <div className="text-white">
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : user ? (
        <div className="space-y-6">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-gray-500 flex items-center justify-center overflow-hidden">
              <img
                src={user.avatar || 'https://via.placeholder.com/80'}
                alt={user.username || 'User'}
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-xl font-semibold mt-2">{user.username || 'Unknown User'}</h2>
            <p className="text-sm text-gray-400">{user.email || `+977 ${user.phone || 'N/A'}`}</p>
          </div>

          <div className="space-y-4">
            {/* <div>
              <h3 className="text-sm font-medium text-gray-300">Name</h3>
              <p className="text-sm">{user.name}</p>
            </div> */}
            <div>
              <h3 className="text-sm font-medium text-gray-300">Email</h3>
              <p className="text-sm">{user.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-300">Phone</h3>
              <p className="text-sm text-gray-400">{user.phone}</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500">No user data available</p>
      )}
    </div>
  );
};

export default UserInfom;