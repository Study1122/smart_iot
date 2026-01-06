import axios from "axios";

const API_URL = "http://10.87.22.179:5000/devices"; 
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

// ➕ Create new device (UI use)
export const createDevice = async (data) => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.post(
      API_URL,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data; // { success, device }
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || "Failed to create device",
    };
  }
};

// ✏️ Update device name
export const updateDevice = async (deviceId, data) => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.patch(
      `${API_URL}/${deviceId}`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return res.data;
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || "Failed to update device",
    };
  }
};

// 🗑️ Delete device
export const deleteDevice = async (deviceId) => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.delete(
      `${API_URL}/${deviceId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return res.data;
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || "Failed to delete device",
    };
  }
};


// ➕ Add feature to device
export const addFeature = async (deviceId, data) => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.post(
      `${API_URL}/${deviceId}/features`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return res.data; // { success, features }
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || "Failed to add feature",
    };
  }
};

// ✏️ Edit feature metadata
export const updateFeatureMeta = async (deviceId, featureId, data) => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.patch(
      `${API_URL}/${deviceId}/features/${featureId}/meta`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return res.data; // { success, feature }
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || "Failed to update feature",
    };
  }
};

// 🗑️ Delete feature
export const deleteFeature = async (deviceId, featureId) => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.delete(
      `${API_URL}/${deviceId}/features/${featureId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return res.data;
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || "Failed to delete feature",
    };
  }
};