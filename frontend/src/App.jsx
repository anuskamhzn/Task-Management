import React from 'react';
import { Route, Routes, NavLink } from 'react-router-dom';
import { Toaster } from "react-hot-toast";
import Login from './Pages/Auth/Login';
import Register from './Pages/Auth/Registration';
import Dashboard from './Pages/User/Dashboard';
import Homepage from './Pages/Homepage';
import UserInfo from './Pages/User/UserInfo';
import Project from './Components/Dashboard/Project/Project';
import CreateTask from './Pages/User/Create/CreateTask';
import HomePage from './Pages/folder/home';
import Profile from './Pages/folder/doctorP';
import ForgetPassword from './Pages/Auth/ForgetPass/ForgetPassword';
import ResetPassword from './Pages/Auth/ForgetPass/ResetPassword';
import Task from './Components/Dashboard/Task/Task';
import CreateSubtask from './Pages/User/Create/CreateSubtask';
import CreateProject from './Pages/User/Create/CreateProject';
import CreateSubproject from './Pages/User/Create/CreateSubproject';

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
          <Route path="/dashboard" element={<Dashboard />}/>
          <Route path = "/userInfo" element={<UserInfo />}/>
          <Route path = "/task" element={<CreateTask />}/>
          <Route path="/task/subtask/:taskId" element={<Task />} />
          <Route path="/create-task/:mainTaskId" element={<CreateSubtask />} />
          <Route path="/create" element={<CreateProject />} />
          <Route path="/project/subproject/:projectId" element={<Project />} />
          <Route path="/create-project/:projectId" element={<CreateSubproject />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
  );
};

export default App;
