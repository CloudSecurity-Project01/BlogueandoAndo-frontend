import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from "./services/authService";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Post from "./pages/Post";
import Layout from "./components/Layout";
import Error from "./components/Error";
import "./App.css";
import ResetPasswordForm from "./pages/ResetPasswordForm";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPasswordForm />} />
          <Route path="/" element={<Navigate to="/home" />} />

          <Route element={<Layout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/post/:id" element={<Post />} />
            <Route path="*" element={<Error type="NotFound"/>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
