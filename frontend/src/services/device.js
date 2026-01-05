import axios from "axios";

const API_URL = "http://10.141.192.179:5000/devices"; 
// ⚠️ use your backend IP (same as auth)

//get all devices belonged to logged in user (useCase)
export const getUserDevices = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data; // { success, devices }
  } catch (err) {
    return {
      success: false,
      message: "Failed to fetch devices",
    };
  }
};

//get single device from logged in user (useCase)
export const getDeviceById = async (id) => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (err) {
    return {
      success: false,
      message: "Failed to fetch device",
    };
  }
};


//➕ Add this function

export const toggleFeature = async (deviceId, featureId, state) => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.patch(
      `${API_URL}/${deviceId}/features/${featureId}`,
      { state },
      { headers: {Authorization: `Bearer ${token}`,},}
    );

    return res.data;
  } catch (err) {
    return {
      success: false,
      message: "Failed to update feature",
    };
  }
};

