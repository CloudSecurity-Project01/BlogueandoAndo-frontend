import config from "../config";
import { fetchWithAuth } from "./authService";

export const loginUser = async (email, password) => {
    return await fetch(`${config.API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
}

export const registerUser = async (name, email, password) => {
    return await fetch(`${config.API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
}

export const getUser = async () => {
    return await fetchWithAuth(`${config.API_BASE_URL}/user`, {
        method: "GET",
    });
}