import axios from "axios";
const API_URL = import.meta.env.VITE_BACKEND_URL+"/auth"; // backend base URL

// Register a new user
export const register = async (name, email, password) => {
  try {
    const res = await axios.post(`${API_URL}/register`, {
      name,
      email,
      password,
    });
    return res.data; // { success, message, token }
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || "Network error",
    };
  }
};

// Login user
export const login = async (email, password) => {
  try {
    const res = await axios.post(`${API_URL}/login`, {
      email,
      password,
    });
    return res.data; // { success, message, token }
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || "Network error",
    };
  }
};

export const getMe = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (err) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }
};