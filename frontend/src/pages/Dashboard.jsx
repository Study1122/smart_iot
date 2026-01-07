import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe } from "../services/auth";
import { timeAgo } from "../services/timeAgo";
import { 
  getUserDevices, 
  createDevice,
  updateDevice, 
  deleteDevice, 
} from "../services/deviceService";

import Navbar from "../components/Navbar/Navbar";
const Dashboard = () => {
  
  const [user, setUser] = useState(null);
  const [devices, setDevices] = useState([]);
  const [editingDeviceId, setEditingDeviceId] = useState(null);
  const [editName, setEditName] = useState("");
  const navigate = useNavigate();
  
  
  useEffect(() => {
    let intervalId;
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
    intervalId = setInterval(init, 5000); // 🔄 refresh status every
    return () => clearInterval(intervalId);
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
  
  const getDeviceStats = (device) => {
    const features = device.features || [];
  
    const total = features.length;
    const on = features.filter(
      (f) => f.reportedState === true
    ).length;
  
    const pending = features.filter(
      (f) => f.desiredState !== f.reportedState
    ).length;
  
    return { total, on, pending };
  };
  
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
  
  const startEditDevice = (item) => {
    setEditingDeviceId(item._id);
    setEditName(item.name);
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
        <ul 
          style={{ 
            listStyle: "none", 
            padding: 0,
          }}>
          
          {devices.map((item) => {
            const { total, on, pending } = getDeviceStats(item);
            const isOffline = item.status !== "online";
          
            return (
              <li
                key={item._id}
                style={{
                  margin: "0.75rem 0",
                  padding: "1rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  background: isOffline ? "#f9fafb" : "#fff",
                  opacity: isOffline ? 0.6 : 1,
                }}
              >
                {/* DEVICE MAIN INFO */}
                <div
                  onClick={() =>
                    item.status === "online" && navigate(`/device/${item._id}`)
                  }
                  style={{
                    cursor: item.status === "online" ? "pointer" : "default",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <strong style={{ fontSize: 16 }}>{item.name}</strong>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>
                        ID: {item.deviceId}
                      </div>
                    </div>
          
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: item.status === "online" ? "#16a34a" : "#dc2626",
                      }}
                    >
                      {item.status === "online" ? "🟢 Online" : "🔴 Offline"}
                    </span>
                  </div>
          
                  {/* STATS */}
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      marginTop: "0.5rem",
                      fontSize: 13,
                      color: "#374151",
                    }}
                  >
                    <span>⚙️ {total} Features</span>
                    <span>🟢 {on} ON</span>
                    {pending > 0 && <span>⏳ {pending} Syncing...</span>}
                  </div>
          
                  {/* LAST SEEN */}
                  <div style={{ marginTop: "0.4rem", fontSize: 12, color: "#6b7280" }}>
                    Last seen: {timeAgo(item.lastSeen)}
                  </div>
                </div>
          
                {/* ACTIONS */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "0.75rem",
                    marginTop: "0.75rem",
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditDevice(item);
                    }}
                    style={{ padding: "6px 10px" }}
                  >
                    ✏️
                  </button>
          
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDevice(item._id);
                    }}
                    style={{ padding: "6px 10px" }}
                  >
                    🗑️
                  </button>
                </div>
          
                {/* INLINE EDIT */}
                {editingDeviceId === item._id && (
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
                    <button onClick={() => saveEditDevice(item._id)}>Save</button>
                    <button onClick={cancelEdit}>Cancel</button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  )
};

export default Dashboard;