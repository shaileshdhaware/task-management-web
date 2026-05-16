import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';

import Navbar from './Components/Navbar/NavbarComponent';
import Dashboard from './Components/Dashboard/Dashboard';
import { TaskForm } from './Components/TaskManager/CreateTask';
import { LoginForm } from './Components/LoginForm';
import { AuthState } from './Components/types';

function App() {
  const [auth, setAuth] = useState<AuthState>({
    token: localStorage.getItem('token'),
    role: null
  });

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/createtask" element={<TaskForm />} />
        <Route path="/login" element={<LoginForm setAuth={setAuth} />} />
      </Routes>
    </Router>
  );
}

export default App;
