import React, { createContext, useState, useContext, useEffect } from "react";
import { getUser, loginUser } from "../services/userService";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (response.status === 401) {
      const data = await response.json();
      let errorMessage = data.detail || "No estás autorizado";
      
      if (data.detail && data.detail.includes('expired')) {
        localStorage.removeItem("token");
        setTimeout(() => {
          alert("¡Vaya! Tu sesión ha expirado. Vuelve a iniciar sesión.");
          window.location.href = "/home";
        }, 0);
        return Promise.reject(new Error("Tu sesión ha expirado"));
      } else {
        throw new Error(errorMessage);
      }
    }

    if (!response.ok) {
      let errorText = "";
      try {
        const errorData = await response.json();
        errorText = errorData.message || errorData.error || JSON.stringify(errorData);
      } catch (parseError) {
        errorText = await response.text();
      }
      throw new Error(`Ocurrió un error al procesar tu solicitud: ${response.status} - ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Ocurrió un error en fetchWithAuth:", error);
    throw error;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  useEffect(() => {
    if (!token) return;

    getUser()
      .then(setUser)
      .catch((error) => {
        console.error("Error getting User", error);
        setUser(null);
      });

  }, [token]);


  const login = async (email, password) => {
    try {
      const response = await loginUser(email, password);

      if (!response.ok) {
        console.log(response);
        const errorData = await response.json();
        throw new Error(errorData.detail || "Credenciales incorrectas");
      }

      const data = await response.json();

      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        setToken(data.access_token);
      } else {
        throw new Error("Credenciales incorrectas");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };


  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
