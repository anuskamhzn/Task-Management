import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
  const auth = JSON.parse(localStorage.getItem("auth"));

  if (!auth || auth.user.role !== "Admin") {
    return <Navigate to="/" />; // Redirect to homepage if not an admin
  }

  return <Outlet />; // Render the admin dashboard if the user is an admin
};

export default AdminRoute;
