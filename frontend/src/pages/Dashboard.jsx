import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe } from "../services/auth";
import { 
  getUserDevices, 
  createDevice,
  updateDevice, 
  deleteDevice, 
} from "../services/device";
import Navbar from "../components/Navbar/Navbar";
const Dashboard = () => {
  
  const [user, setUser] = useState(null);
  const [devices, setDevices] = useState([]);
  const [editingDeviceId, setEditingDeviceId] = useState(null);
  const [editName, setEditName] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    const init = async () => {
      const res = await getMe();
      
      if (!res.success) {
        // token invalid or missing
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      
    setUser(res.user);
    
    const deviceRes = await getUserDevices();
      if (deviceRes.success) {
        setDevices(deviceRes.devices);
      }
    };
    init();
  }, [navigate]);
  
  const handleAddDevice = async () => {
    const name = prompt("Enter device name:");
    if (!name) return;
  
    const deviceId = prompt("Enter unique device ID:");
    if (!deviceId) return;
  
    const res = await createDevice({ name, deviceId });
  
    if (res.success) {
      alert("Device added successfully");
      const deviceRes = await getUserDevices();
      if (deviceRes.success) {
        setDevices(deviceRes.devices);
      }
    } else {
      alert(res.message || "Failed to add device");
    }
  };
  
  /*
  const handleEditDevice = async (device) => {
    const newName = prompt("Edit device name:", device.name);
    if (!newName || newName === device.name) return;
  
    const res = await updateDevice(device._id, { name: newName });
  
    if (res.success) {
      setDevices((prev) =>
        prev.map((d) =>
          d._id === device._id ? res.device : d
        )
      );
    } else {
      alert(res.message);
    }
  };
  */
  const handleDeleteDevice = async (deviceId) => {
    const ok = window.confirm("Delete this device?");
    if (!ok) return;
  
    const res = await deleteDevice(deviceId);
  
    if (res.success) {
      setDevices((prev) => prev.filter((d) => d._id !== deviceId));
    } else {
      alert(res.message);
    }
  };
  
  const startEditDevice = (device) => {
    setEditingDeviceId(device._id);
    setEditName(device.name);
  };
  
  const saveEditDevice = async (deviceId) => {
    if (!editName.trim()) return alert("Name cannot be empty");
  
    const res = await updateDevice(deviceId, { name: editName });
  
    if (res.success) {
      setDevices((prev) =>
        prev.map((d) => (d._id === deviceId ? res.device : d))
      );
      setEditingDeviceId(null);
      setEditName("");
    } else {
      alert(res.message);
    }
  };
  
  const cancelEdit = () => {
    setEditingDeviceId(null);
    setEditName("");
  };

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <>
      {/* ✅ NAVBAR */}
      <Navbar user={user} />
      
      {/* ✅ DEVICE LISTS */}
      <div style={{ maxWidth: "700px", margin: "2rem auto" }}>
        <h1>Dashboard</h1>

        <h3 style={{ marginTop: "1rem" }}>Your Devices</h3>

        {devices.length === 0 && <p>No devices registered yet.</p>}
        <button
          onClick={handleAddDevice}
          style={{
            marginBottom: "1rem",
            padding: "8px 12px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
          }}
        >
          ➕ Add Device
        </button>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {devices.map((device) => (
            <li
              key={device._id}
              style={{
                marginBottom: "1rem",
                padding: "0.75rem",
                border: "1px solid #ddd",
                borderRadius: "6px",
              }}
            >
              {/* 🔹 Device row */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  onClick={() => navigate(`/device/${device._id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <strong>{device.name}</strong> — {device.deviceId}
                </div>
        
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => startEditDevice(device)}>✏️</button>
                  <button onClick={() => handleDeleteDevice(device._id)}>🗑️</button>
                </div>
              </div>
        
              {/* 🔽 Inline edit form */}
              {editingDeviceId === device._id && (
                <div
                  style={{
                    marginTop: "0.75rem",
                    display: "flex",
                    gap: "0.5rem",
                  }}
                >
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={{ flex: 1, padding: "6px" }}
                  />
        
                  <button onClick={() => saveEditDevice(device._id)}>Save</button>
                  <button onClick={cancelEdit}>Cancel</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
    
  );
};

export default Dashboard;