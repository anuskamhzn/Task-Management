import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/auth";

const UsersInfo = () => {
  const [auth, setAuth] = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchUser = async () => {
      if (!auth?.token) {
        setLoading(false);
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_API}/api/admin/users-info/${id}`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        setUser(response.data.user);
      } catch (err) {
        if (err.response?.status === 401) {
          setAuth({ token: null, user: null });
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setError("Session expired. Please log in again.");
          navigate("/login");
        } else {
          setError(err.response?.data?.message || "Error fetching user");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [auth, setAuth, navigate, id]);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-600">{error}</div>;
  }

  if (!user) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">No user found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">User Details</h2>
        <div className="space-y-4">
          <div>
            <span className="font-medium text-gray-700">Name:</span> {user.name || "Unknown"}
          </div>
          <div>
            <span className="font-medium text-gray-700">Email:</span> {user.email || "N/A"}
          </div>
          <div>
            <span className="font-medium text-gray-700">Joined Date:</span>{" "}
            {user.createdAt && !isNaN(new Date(user.createdAt).getTime())
              ? new Date(user.createdAt).toLocaleDateString()
              : "N/A"}
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={() => navigate("/dashboard/admin/users")}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
          >
            Back to Users
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsersInfo;