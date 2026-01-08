import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe } from "../services/auth";
import { timeAgo } from "../services/timeAgo";
import { COLORS } from "../constants/colors";

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
      <Navbar user={user} />
  
      <div
        style={{
          maxWidth: 720,
          margin: "2rem auto",
          padding: "0 1rem",
        }}
      >
        <h1 style={{ marginBottom: "0.25rem", color: COLORS.textPrimary }}>
          Dashboard
        </h1>
        <p style={{ color: COLORS.textSecondary, marginBottom: "1rem" }}>
          Your Devices
        </p>
  
        <button
          onClick={handleAddDevice}
          style={{
            marginBottom: "1.25rem",
            padding: "0.6rem 1rem",
            borderRadius: 8,
            border: "none",
            background: COLORS.primaryLight,
            color: COLORS.textInverse,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          ➕ Add Device
        </button>
  
        {devices.length === 0 && (
          <p style={{ color: COLORS.textSecondary }}>
            No devices registered yet.
          </p>
        )}
  
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "1rem" }}>
          {devices.map((item) => {
            const { total, on, pending } = getDeviceStats(item);
            const isOffline = item.status !== "online";
  
            return (
              <li
                key={item._id}
                
                style={{
                  position: "relative",
                  borderRadius: 12,
                  boxShadow: item.status === "online" ? COLORS.shadowSoft: COLORS.shadowGray,
                  border: item.status === "online" ? `.1rem solid ${COLORS.accentLight}` :`.1rem solid ${COLORS.textSecondary}`,
                  padding: "1rem",
                  paddingBottom: "4rem",
                  opacity: item.status !== "online" ? 0.6 : 1,
                  background: item.status === "online" ? "#f9fafb" : "#fff",
                  pointerEvents: item.status === "online" ? "auto" : "none",
                }}
              >
                {/* MAIN CLICK AREA */}
                <div
                  onClick={() =>
                    item.status === "online" &&
                    navigate(`/device/${item._id}`)
                  }
                  style={{
                    cursor: item.status === "online" ? "pointer" : "default",
                  }}
                >
                  {/* HEADER */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: 16, color: COLORS.textPrimary }}>
                        {item.name}
                      </strong>
                      <div
                        style={{
                          fontSize: 12,
                          color: COLORS.textSecondary,
                        }}
                      >
                        ID: {item.deviceId}
                      </div>
                    </div>
  
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color:
                          item.status === "online"
                            ? COLORS.success
                            : COLORS.error,
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
                      marginTop: "0.6rem",
                      fontSize: 13,
                      color: COLORS.textSecondary,
                    }}
                  >
                    <span>⚙️ {total} Features</span>
                    <span>🟢 {on} ON</span>
                    {pending > 0 && (
                      <span style={{ color: COLORS.warning }}>
                        ⏳ {pending} Syncing
                      </span>
                    )}
                  </div>
  
                  {/* LAST SEEN */}
                  <div
                    style={{
                      marginTop: "0.4rem",
                      fontSize: 12,
                      color: COLORS.textSecondary,
                    }}
                  >
                    Last seen: {timeAgo(item.lastSeen)}
                  </div>
                </div>
  
                {/* ACTIONS */}
                <div
                  style={{
                    position:"absolute",
                    bottom: 0,left:0,
                    width:"100%",
                    display: "flex",
                    padding: ".7rem",
                    borderRadius:"0 0 10px 10px",
                    justifyContent: "space-between",
                    backgroundColor: COLORS.accentLight,
                    gap: "0.75rem",
                    marginTop: 12,
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditDevice(item);
                    }}
                    style={iconButton}
                  >
                    ✏️
                  </button>
  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDevice(item._id);
                    }}
                    style={{
                      ...iconButton,
                      color: COLORS.error,
                    }}
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
                      style={{
                        flex: 1,
                        padding: "0.45rem",
                        borderRadius: 6,
                        border: `1px solid ${COLORS.borderLight}`,
                      }}
                    />
                    <button style={primaryBtn} onClick={() => saveEditDevice(item._id)}>
                      Save
                    </button>
                    <button style={ghostBtn} onClick={cancelEdit}>
                      Cancel
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
};

const iconButton = {
  padding: "6px 10px",
  borderRadius: 8,
  border: `1px solid ${COLORS.borderDark}`,
  background: COLORS.bgCard,
  cursor: "pointer",
};

const primaryBtn = {
  padding: "6px 12px",
  borderRadius: 8,
  border: "none",
  background: COLORS.primary,
  color: COLORS.textInverse,
  fontWeight: 600,
};

const ghostBtn = {
  padding: "6px 12px",
  borderRadius: 8,
  border: `1px solid ${COLORS.borderLight}`,
  background: "transparent",
};

export default Dashboard;