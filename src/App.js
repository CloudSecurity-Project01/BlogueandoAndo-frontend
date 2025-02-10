import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Register from "./pages/Register";
import FullPostView from "./components/FullPostView";
import Layout from "./components/Layout";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/home" />} />

          <Route element={<Layout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/post/:id" element={<FullPostView />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
