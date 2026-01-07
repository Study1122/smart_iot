import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe } from "../services/auth";
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
    let interval;
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
    interval = setInterval(init, 5000); // 🔄 refresh status every
    return () => clearInterval(interval);
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
            return (
              <li
                key={item._id}
                style={{
                  margin: ".5rem 1rem",
                  padding: "0.75rem",
                  border: "1px solid #aaa",
                  borderRadius: "6px",
                }}>

                {/* 🔹 Device row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-evenly",
                    alignItems: "center",
                    border: "2px solid brown",
                  }}>
                  {/* Device_Info_division */}
                  <div
                    onClick={() => item.status === "online" && navigate(`/device/${item._id}`)}
                    style={{ 
                      display:"flex",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      padding: ".2rem",
                      border: "1px solid red",
                      width:"100%",
                      opacity:item.status !== "online"? 0.4 : 1,
                      background: item.status !== "online" ? "#f9fafb" : "#fff",
                    }}>
                    <div 
                      style={{
                        border: "2px solid blue", 
                        display:"flex",
                        flexDirection: "column",
                        width:"40%"
                      }}>
                      <strong>{item.name}</strong>
                      <span style={{ fontSize: 13, color: "#555" }}>
                        ID: {item.deviceId}
                      </span>
                    </div>
                    <div
                      style={{
                        border: "2px solid green", 
                        display:"flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems:  "center",
                        width:"20%"
                      }}>
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
                    
                    <div
                      style={{
                        pending: "1rem",
                        display: "flex",
                        
                        justifyContent:"center",
                        flexDirection: "column",
                        fontSize: 13,
                        width: "30%",
                        border: "2px solid purple", 
                        flexWrap: "wrap",
                      }}>
                      <span> ⚙️ {total} Features</span>
                      <span> 🟢 {on} ON </span>
                    
                      {pending > 0 && (
                        <span>⏳ {pending} Pending</span>
                      )}
                    </div>
                    
                    <div
                      style={{
                        display: "flex",
                        border: "2px solid pink", 
                        justifyContent: "center",
                        alignItems:  "center",
                        width:"30%",
                      }}>
                      <span style={{ fontSize: 12, color: "#666" }}>
                        Last seen: {item.lastSeen || "Never"}
                      </span>
                    </div>
                </div>
                
                {/*  Device_edit_tool */}
                <div 
                  style={{ 
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    border: "1px solid red",
                    
                  }}>
                  <button onClick={(e) => {
                    e.stopPropagation()
                    startEditDevice(item)
                  }}>✏️</button>
                  <button onClick={() => { 
                    handleDeleteDevice(item._id)
                  }}>🗑️</button>
                </div>
              </div>
        
              {/* 🔽 Inline edit form */}
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
            )
          })}
        </ul>
      </div>
    </>
  )
};

export default Dashboard;