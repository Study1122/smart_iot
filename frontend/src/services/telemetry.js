import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const getLatestTelemetry = async (deviceId) => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      `${API_URL}/telemetry/${deviceId}/latest`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const getTelemetryHistory = async (deviceId, limit = 20) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(
      `${API_URL}/telemetry/${deviceId}/history?limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  } catch (error) {
    return { success: false };
  }
};