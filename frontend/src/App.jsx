import React from 'react';
import { Route, Routes, NavLink } from 'react-router-dom';
import { Toaster } from "react-hot-toast";
import Login from './Pages/Auth/Login';
import Register from './Pages/Auth/Registration';
import Dashboard from './Pages/User/Dashboard';
import Homepage from './Pages/Homepage';
import UserInfo from './Pages/User/UserInfo';
import Project from './Components/Dashboard/SubProject/Project';
import CreateTask from './Pages/User/Create/CreateTask';
import ForgetPassword from './Pages/Auth/ForgetPass/ForgetPassword';
import ResetPassword from './Pages/Auth/ForgetPass/ResetPassword';
import Task from './Components/Dashboard/SubTask/Task';
import CreateSubtask from './Pages/User/Create/CreateSubtask';
import CreateProject from './Pages/User/Create/CreateProject';
import CreateSubproject from './Pages/User/Create/CreateSubproject';
import UserRoutes from './Components/Routes/UserRoutes';
import AdminRoutes from './Components/Routes/AdminRoute';
import AdminDashboard from './Pages/Admin/AdminDashboard';
import Tasks from './Pages/User/Tasks/Tasks';
import Projects from './Pages/User/Projects/Projects';
// import Message from './Pages/User/Message/Message';
import Message from './Pages/User/MesTest/Message';
import TaskTrash from './Pages/User/Tasks/Trash';
import SubtaskTrash from './Pages/User/Tasks/SubtaskTrash';
import SubprojectTrash from './Pages/User/Projects/SubprojectTrash';
import ProjectTrash from './Pages/User/Projects/ProjectTrash';

const App = () => {
  return (
    <div className="App">
      <Toaster />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forget-pass" element={<ForgetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

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
          <Route path="messages" element={<Message />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/dashboard" element={<AdminRoutes />}>
          <Route path="admin" element={<AdminDashboard />} />
        </Route>

      </Routes>
    </div>
  );
};

export default App;
