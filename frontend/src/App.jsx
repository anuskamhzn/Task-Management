import React, { Suspense } from 'react';
import { Route, Routes, NavLink } from 'react-router-dom';
import { Toaster } from "react-hot-toast";
import ProjectGantt from './Components/Dashboard/SubProject/GanttChart';
import TaskGanttChart from './Components/Dashboard/SubTask/TaskGanttChart';
import VerifyOTP from './Pages/Auth/VerifyOTP';
import Users from './Pages/Admin/Users';
import Analytics from './Pages/Admin/Analytics';
import Settings from './Pages/Admin/Settings';
import AProfile from './Pages/Admin/AdminProfile';

// Lazy load components
const Login = React.lazy(() => import('./Pages/Auth/Login'));
const Register = React.lazy(() => import('./Pages/Auth/Registration'));
const Dashboard = React.lazy(() => import('./Pages/User/Dashboard'));
const Homepage = React.lazy(() => import('./Pages/Homepage'));
const UserInfo = React.lazy(() => import('./Pages/User/UserInfo'));
const Project = React.lazy(() => import('./Components/Dashboard/SubProject/Project'));
const CreateTask = React.lazy(() => import('./Pages/User/Create/CreateTask'));
const ForgetPassword = React.lazy(() => import('./Pages/Auth/ForgetPass/ForgetPassword'));
const ResetPassword = React.lazy(() => import('./Pages/Auth/ForgetPass/ResetPassword'));
const Task = React.lazy(() => import('./Components/Dashboard/SubTask/Task'));
const CreateSubtask = React.lazy(() => import('./Pages/User/Create/CreateSubtask'));
const CreateProject = React.lazy(() => import('./Pages/User/Create/CreateProject'));
const CreateSubproject = React.lazy(() => import('./Pages/User/Create/CreateSubproject'));
const UserRoutes = React.lazy(() => import('./Components/Routes/UserRoutes'));
const AdminRoutes = React.lazy(() => import('./Components/Routes/AdminRoute'));
const AdminDashboard = React.lazy(() => import('./Pages/Admin/AdminDashboard'));
const Tasks = React.lazy(() => import('./Pages/User/Tasks/Tasks'));
const Projects = React.lazy(() => import('./Pages/User/Projects/Projects'));
const Message = React.lazy(() => import('./Pages/User/MesTest/Message'));
const TaskTrash = React.lazy(() => import('./Pages/User/Tasks/Trash'));
const SubtaskTrash = React.lazy(() => import('./Pages/User/Tasks/SubtaskTrash'));
const SubprojectTrash = React.lazy(() => import('./Pages/User/Projects/SubprojectTrash'));
const ProjectTrash = React.lazy(() => import('./Pages/User/Projects/ProjectTrash'));
const Setting = React.lazy(() => import('./Pages/User/Setting'));
const UserInfom = React.lazy(() => import('./Pages/User/MesTest/UserInfo/UserInfo'));
const Notifications = React.lazy(() => import('./Pages/User/Notifications'));
const KanbanUser = React.lazy(() => import('./Pages/User/Kanban'));

// Loading component
const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
  </div>
);

const App = () => {
  return (
    <div className="App">
      <Toaster />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forget-pass" element={<ForgetPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />

          {/* User Routes */}
          <Route path="/dashboard" element={<UserRoutes />}>
            <Route path="user" element={<Dashboard />} />
            <Route path="userInfo" element={<UserInfo />} />
            <Route path="task" element={<CreateTask />} />
            <Route path="task/subtask/:taskId" element={<Task />} />
            <Route path="create-task/:mainTaskId" element={<CreateSubtask />} />
            <Route path="create" element={<CreateProject />} />
            <Route path="project/subproject/:projectId" element={<Project />} />
            <Route path="create-project/:projectId" element={<CreateSubproject />} />
            <Route path="my_tasks" element={<Tasks />} />
            <Route path="trash" element={<TaskTrash />} />
            <Route path="subtask-trash/:mainTaskId" element={<SubtaskTrash />} />
            <Route path="team_projects" element={<Projects />} />
            <Route path="projectTrash" element={<ProjectTrash />} />
            <Route path="subproject-trash/:mainTaskId" element={<SubprojectTrash />} />
            <Route path="userInfom/:userId" element={<UserInfom />} />
            <Route path="messages" element={<Message />} />
            <Route path="settings" element={<Setting />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="kanban" element={<KanbanUser />} />
            <Route path="project/:projectId/gantt" element={<ProjectGantt  />} />
            <Route path="task/:taskId/gantt" element={<TaskGanttChart  />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/dashboard" element={<AdminRoutes />}>
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin-profile" element={<AProfile />} />
            <Route path="users" element={<Users />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="admin-settings" element={<Settings />} />
          </Route>
        </Routes>
      </Suspense>
    </div>
  );
};

export default App;
