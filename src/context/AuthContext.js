import React, { createContext, useState, useContext, useEffect } from "react";
import config from "../config";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  useEffect(() => {
    if (token) {
      const fetchUserData = async () => {
        try {
          const response = await fetch(`${config.API_BASE_URL}/user`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error("Error obteniendo los datos del usuario");
          }

          const userData = await response.json();
          setUser(userData);
        } catch (error) {
          console.error(error);
        }
      };

      fetchUserData();
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
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
