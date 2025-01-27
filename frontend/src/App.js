import React from 'react';
import { Route, Routes, NavLink } from 'react-router-dom';
import { Toaster } from "react-hot-toast";
import Login from './Pages/Auth/Login';
import Register from './Pages/Auth/Registration';
import Dashboard from './Pages/User/Dashboard';
import Homepage from './Pages/Homepage';
import UserInfo from './Pages/User/UserInfo';
import Project from './Pages/User/Project';

const App = () => {
  return (
      <div className="App">
        <Toaster />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />}/>
          <Route path = "/userInfo" element={<UserInfo />}/>
          <Route path="/project/:id" element={<Project />} /> {/* Dynamic route */}
        </Routes>
      </div>
  );
};

export default App;
