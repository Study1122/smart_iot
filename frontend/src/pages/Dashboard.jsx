import Loader from "../components/Loader";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe } from "../services/auth";
import { timeAgo } from "../services/timeAgo";
import { COLORS } from "../constants/colors";
import { FONTS } from "../constants/fonts";

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
  const [visibleSecrets, setVisibleSecrets] = useState({});
  const [copiedDeviceId, setCopiedDeviceId] = useState(null);
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
  
  /**
   * DEVICE SECRET
   */
   
  const toggleSecret = (deviceId) => {
    setVisibleSecrets(prev => ({
      ...prev,
      [deviceId]: !prev[deviceId],
    }));
  };
  
  const maskSecret = (secret) => {
    if (!secret) return "";
    return secret.slice(0, 4) + "••••••••••" + secret.slice(-4);
  };

  const copySecret = async (deviceId, secret) => {
    try {
      // Try modern clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(secret);
      } else {
        // 🔁 Fallback for mobile / insecure context
        const textArea = document.createElement("textarea");
        textArea.value = secret;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
  
      setCopiedDeviceId(deviceId);
      setTimeout(() => setCopiedDeviceId(null), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
      alert("Unable to copy. Long-press to copy manually.");
    }
  };
  
  
  /**
   * HANDLE DELETE
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
    return <Loader text="Checking session..." />;
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
        <h1 style={{
          ...FONTS.h1,
          marginBottom: "0.25rem",
          color: COLORS.textPrimary,
        }}>
          Dashboard
        </h1>
        <p style={{ 
          ...FONTS.p,
          color: COLORS.textSecondary,
          marginBottom: "1rem" 
          
        }}>
          Your Devices
        </p>
  
        <button
          onClick={handleAddDevice}
          style={{
            ...iconButton,
            ...FONTS.h3,
            marginBottom:".7rem",
            
            cursor: "pointer",
          }}
        >
          ➕ Add New Device
        </button>
  
        {devices.length === 0 && (
          <p style={{...FONTS.p, color: COLORS.textSecondary }}>
            No devices registered yet.
          </p>
        )}
  
        <ul 
          style={{ 
            ...FONTS.h3,
            fontWeight: FONTS.semibold,
            listStyle: "none", 
            padding: 0, display: "grid", 
            gap: "1rem",
          }}>
          
          {devices.map((device) => {
            const { total, on, pending } = getDeviceStats(device);
            const isOffline = device.status !== "online";
  
            return (
              <li
                key={device._id}
                
                style={{
                  position: "relative",
                  borderRadius: 12,
                  boxShadow: device.status === "online" ? COLORS.shadowSoft: COLORS.shadowDarkGray,
                  border: device.status === "online" ? `.1rem solid ${COLORS.accentDark}` :`.1rem solid ${COLORS.textSecondary}`,
                  padding: "1rem",
                  paddingBottom: "4rem",
                  opacity: device.status !== "online" ? 0.6 : 1,
                  background: device.status === "online" ? "#f9fafb" : "#fff",
                  pointerEvents: device.status === "online" ? "auto" : "none",
                }}
              >
                {/* MAIN CLICK AREA */}
                <div
                  onClick={() =>
                    device.status === "online" &&
                    navigate(`/device/${device._id}`)
                  }
                  style={{
                    
                    cursor: device.status === "online" ? "pointer" : "default",
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
                        {device.name}
                      </strong>
                      <div
                        style={{
                          fontSize: 12,
                          color: COLORS.textSecondary,
                        }}
                      >
                        ID: {device.deviceId}
                      </div>
                    </div>
  
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color:
                          device.status === "online"
                            ? COLORS.success
                            : COLORS.error,
                      }}
                    >
                      {device.status === "online" ? "🟢 Online" : "🔴 Offline"}
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
                    Last seen: {timeAgo(device.lastSeen)}
                  </div>
                </div>
                
                {/* FOOTER ACTIONS AREA */}
                <div
                  style={{
                    position:"absolute",
                    bottom: 0,left:0,
                    width:"100%",
                    padding: ".5rem 1rem",
                    borderRadius:"0 0 10px 10px",
                    backgroundColor: device.status === "online" ? COLORS.accentLight : COLORS.lightGray,
                  }}
                >
                  {/*DEVICE FOOTER AREA*/}
                  <div 
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                      margin: 0,
                      padding: 0,
                    }}
                  
                  >
                    
                    {/* 🔐 DEVICE SECRET */}
                      
                    { device.status === "online" && (
                      <div 
                        style={{ 
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          margin: 0,
                          padding: 0,
                          gap:".2rem"
                        }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSecret(device._id);
                          }}
                          style={{
                            ...ghostBtn,
                            fontSize: FONTS.lg,
                            margin:"0",
                            backgroundColor: COLORS.bgPage,
                            color: COLORS.warning,
                            border:`2px solid ${COLORS.info}`, 
                          }}
                        >
                          🔐 {visibleSecrets[device._id] ? "Hide Device Secret" : "Show Device Secret"}
                        </button>
                        
                        {/* inline secret token Show/hide */}
                        {visibleSecrets[device._id] && (
                          <div
                            style={{
                              padding: "0.1rem .2rem",
                              borderRadius: 8,
                              background: COLORS.bgMuted,
                              border: `1px dashed ${COLORS.warning}`,
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              flexWrap: "wrap",
                              marginRight:".5rem"
                            }}
                          >
                            <code
                              style={{
                                background: "#000",
                                color: "#0ff",
                                padding: "0.4rem 0.6rem",
                                borderRadius: 6,
                                fontSize: FONTS.sm,
                                fontFamily: "monospace",
                              }}
                            >
                              {maskSecret(device.secret)}
                            </code>
                      
                            <button
                              style={{
                                ...iconButton,
                                width: "80px",
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                copySecret(device._id, device.secret);
                              }}
                            >
                              📋 Copy
                            </button>
                      
                            {copiedDeviceId === device._id && (
                              <span style={{ fontSize: 12, color: COLORS.success }}>
                                Copied!
                              </span>
                            )}
                          </div>
                        )}
                      </div>  
                    )}
                    
                    {/* EDIT DEVICE AREA */}
                    <div 
                      style={{ 
                        gap: ".2rem",
                        display:"flex",
                        justifyContent:"space-between",
                        marginLeft: "auto",
                    }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditDevice(device);
                        }}
                        style={iconButton}
                      >
                        ✏️
                      </button>
      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDevice(device._id);
                        }}
                        style={{
                          ...iconButton,
                          border: `.1rem solid ${COLORS.error}`,
                          backgroundColor : COLORS.bgPage,
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
  
                {/* INLINE EDIT */}
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
                      style={{
                        ...inputStyle,
                        border:`1px solid ${COLORS.borderDark}`
                      }}
                    />
                    <button style={{
                              ...iconButton,
                              ...FONTS.h3,
                            }} 
                      onClick={() => saveEditDevice(device._id)}>
                      Save
                    </button>
                    <button style={{
                              ...ghostBtn,
                              border: `1px solid ${COLORS.error}`,
                    }} onClick={cancelEdit}>
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

const inputStyle = {
  width: "100%",
  padding: "0.55rem",
  borderRadius: 8,
  border: `1px solid ${COLORS.borderLight}`,
  fontSize: 14,
  outline: "none",
};

const selectStyle = {
  ...inputStyle,
  appearance: "none",          // removes default arrow
  WebkitAppearance: "none",
  MozAppearance: "none",
  backgroundImage: `linear-gradient(45deg, transparent 50%, ${COLORS.textSecondary} 50%),
                    linear-gradient(135deg, ${COLORS.textSecondary} 50%, transparent 50%)`,
  backgroundPosition: "calc(100% - 18px) 55%, calc(100% - 13px) 55%",
  backgroundSize: "5px 5px, 5px 5px",
  backgroundRepeat: "no-repeat",
  cursor: "pointer",
};


const iconButton = {
  padding: "6px 10px",
  borderRadius: 8,
  color: COLORS.bgNavbar,
  fontSize: 16,
  border: `none`,
  background: COLORS.primaryLight,
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
};

const thStyle = {
  padding: "0.5rem",
  borderBottom: `2px solid ${COLORS.borderLight}`,
  textAlign: "left",
};

const tdStyle = {
  padding: "0.5rem",
  borderBottom: `1px solid ${COLORS.borderLight}`,
};


export default Dashboard;