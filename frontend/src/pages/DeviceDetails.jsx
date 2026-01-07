import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import { getMe } from "../services/auth";
import { GPIO_PINS, getGpioByValue } from "../constants/gpioPins";
import { timeAgo } from "../services/timeAgo";
import {
  getDeviceById,
  toggleFeature,
  addFeature,
  updateFeatureMeta,
  updateFeatureLevel,
  deleteFeature,
} from "../services/deviceService";


const ToggleSwitch = ({ checked, disabled, onChange }) => {
  return (
    <div
      onClick={() => !disabled && onChange()}
      style={{
        width: 42,
        height: 22,
        borderRadius: 999,
        background: checked ? "#16a34a" : "#e5e7eb",
        position: "relative",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "background 0.2s",
      }}
    >
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          position: "absolute",
          top: 2,
          left: checked ? 22 : 2,
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }}
      />
    </div>
  );
};

const DeviceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [currentDevice, setCurrentDevice] = useState(null);

  const [showAddFeature, setShowAddFeature] = useState(false);
  const [newFeature, setNewFeature] = useState({
    featureId: "",
    name: "",
    type: "bulb",
  });

  const [editingFeatureId, setEditingFeatureId] = useState(null);
  const [editFeatureData, setEditFeatureData] = useState({
    name: "",
    type: "bulb",
    gpio: null,
  });

  /* ---------------- TOGGLE FEATURE ---------------- */
  const handleToggle = async (feature) => {
    if (!currentDevice) return;
  
    // ❗ Fan should NOT be toggled by switch
    if (feature.type === "fan") return;
  
    const res = await toggleFeature(
      currentDevice._id,
      feature.featureId,
      !feature.desiredState
    );
  
    if (res.success) {
      setCurrentDevice((prev) => ({
        ...prev,
        features: prev.features.map((f) =>
          f.featureId === feature.featureId
            ? { ...f, desiredState: !f.desiredState }
            : f
        ),
      }));
    } else {
      alert(res.message);
    }
  };
  
  /* ---------------- FAN LEVEL ---------------- */
  const handleFanLevelChange = async (feature, level) => {
    if (!currentDevice) return;
  
    // Optimistic UI update
    setCurrentDevice((prev) => ({
      ...prev,
      features: prev.features.map((f) =>
        f.featureId === feature.featureId
          ? { ...f, desiredLevel: level, desiredState: level > 0 }
          : f
      ),
    }));
    
    const prevLevel = feature.desiredLevel;
    
    const res = await updateFeatureLevel(
      currentDevice._id,
      feature.featureId,
      level
    );
  
    if (!res.success) {
      setCurrentDevice(prev => ({
        ...prev,
        features: prev.features.map(f =>
          f.featureId === feature.featureId
            ? { ...f, desiredLevel: prevLevel }
            : f
        )
      }));
      alert(res.message);
    }
  };

  /* ---------------- ADD FEATURE ---------------- */
  const handleAddFeature = async () => {
    if (!currentDevice) return;

    if (!newFeature.featureId.trim() || !newFeature.name.trim()) {
      alert("Feature ID and Name are required");
      return;
    }

    const res = await addFeature(currentDevice._id, newFeature);

    if (res.success) {
      setCurrentDevice((prev) => ({
        ...prev,
        features: res.features,
      }));
      setShowAddFeature(false);
      setNewFeature({ featureId: "", name: "", type: "bulb" });
    } else {
      alert(res.message);
    }
  };

  /* ---------------- EDIT FEATURE ---------------- */
  const startEditFeature = (feature) => {
    setEditingFeatureId(feature.featureId);
    setEditFeatureData({
      name: feature.name,
      type: feature.type,
      gpio: feature.gpio,
    });
  };

  const saveEditFeature = async (featureId) => {
    const res = await updateFeatureMeta(
      currentDevice._id,
      featureId,
      editFeatureData
    );

    if (res.success) {
      setCurrentDevice((prev) => ({
        ...prev,
        features: prev.features.map((f) =>
          f.featureId === featureId ? {...f, ...res.feature } : f
        ),
      }));
      setEditingFeatureId(null);
    } else {
      alert(res.message);
    }
  };

  const cancelEditFeature = () => setEditingFeatureId(null);

  /* ---------------- DELETE FEATURE ---------------- */
  const handleDeleteFeature = async (featureId) => {
    if (!window.confirm("Delete this feature?")) return;

    const res = await deleteFeature(currentDevice._id, featureId);

    if (res.success) {
      setCurrentDevice((prev) => ({
        ...prev,
        features: prev.features.filter(
          (f) => f.featureId !== featureId
        ),
      }));
    } else {
      alert(res.message);
    }
  };

  /* ---------------- BADGE ---------------- */
  const getFeatureBadge = (feature) => {
    if (feature.desiredState !== feature.reportedState) {
      return { text: "Pending", color: "#f59e0b" };
    }
    if (feature.reportedState) {
      return { text: "ON", color: "#16a34a" };
    }
    return { text: "OFF", color: "#dc2626" };
  };

  /* ---------------- FETCH & POLL ---------------- */
  useEffect(() => {
    let intervalId;

    const fetchData = async () => {
      const userRes = await getMe();
      if (!userRes.success) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      setUser(userRes.user);

      const deviceRes = await getDeviceById(id);
      if (deviceRes.success) {
        setCurrentDevice(deviceRes.device);
      }
    };

    fetchData();
    intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, [id, navigate]);

  if (!user || !currentDevice) return <p style={{ padding: 20 }}>Loading...</p>;
  
  const isDeviceOffline = currentDevice.status !== "online";

  /* ---------------- JSX ---------------- */
  return (
    <>
      <Navbar user={user} />

      <div style={{ maxWidth: 900, margin: "2rem auto", padding: "0 1rem" }}>
        {/* DEVICE HEADER */}
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: "1.25rem",
            marginBottom: "1.5rem",
          }}
        >
          <h2 style={{ marginBottom: 6 }}>{currentDevice.name}</h2>
          <div style={{ fontSize: 14, color: "#555" }}>
            <div>Device ID: {currentDevice.deviceId}</div>
            <div>
              Status:{" "}
              <span
                style={{
                  color:
                    currentDevice.status === "online"
                      ? "#16a34a"
                      : "#dc2626",
                  fontWeight: 600,
                }}
              >
                {currentDevice.status}
              </span>
            </div>
            {/* LAST SEEN */}
            <div>
              Last Seen:{" "}
              <strong>
                {timeAgo(currentDevice.lastSeen)}
              </strong>
            </div>
          </div>
        </div>
        
        {isDeviceOffline && (
          <div
            style={{
              marginBottom: "1rem",
              padding: ".75rem 1rem",
              borderRadius: 8,
              background: "#fef2f8",
              color: "#991b1b",
              border: "1px solid #fecaca",
              fontWeight: 500,
            }}
          >
            🔌 Device is offline — controls are disabled
          </div>
        )}

        {/* FEATURES HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h3>Features</h3>
          <button onClick={() => setShowAddFeature((v) => !v)}>
            ➕ Add Feature
          </button>
        </div>

        {/* ADD FEATURE PANEL */}
        {showAddFeature && (
          <div
            style={{
              border: "1px dashed #cbd5f5",
              borderRadius: 10,
              padding: "1rem",
              marginBottom: "1rem",
              display: "flex",
              flexWrap: "wrap",
              gap: ".5rem",
            }}
          >
            <input
              placeholder="Feature ID (unique)"
              value={newFeature.featureId}
              onChange={(e) =>
                setNewFeature({ ...newFeature, featureId: e.target.value })
              }
            />
            
            <select
              value={newFeature.gpio ?? ""}
              onChange={(e) =>
                setNewFeature({
                  ...newFeature,
                  gpio: Number(e.target.value),
                })
              }
            >
              <option value="">Select GPIO</option>
            
              {GPIO_PINS
                .filter((pin) =>
                  newFeature.type === "fan"
                    ? pin.type === "PWM"
                    : pin.type === "DIGITAL"
                )
                .map((pin) => (
                  <option key={pin.value} value={pin.value}>
                    {pin.label} — {pin.type}
                  </option>
                ))}
            </select>
            <input
              placeholder="Name"
              value={newFeature.name}
              onChange={(e) =>
                setNewFeature({ ...newFeature, name: e.target.value })
              }
            />
            <select
              value={newFeature.type}
              onChange={(e) =>
                setNewFeature({ ...newFeature, type: e.target.value })
              }
            >
              <option value="bulb">Bulb</option>
              <option value="fan">Fan</option>
              <option value="switch">Switch</option>
            </select>
            <button onClick={handleAddFeature}>Save</button>
            <button onClick={() => setShowAddFeature(false)}>Cancel</button>
          </div>
        )}

        {/*######  FEATURE LIST   #######*/}
        <div style={{ display: "grid", gap: "1rem" }}>
          {currentDevice.features.map((feature) => {
            const badge = getFeatureBadge(feature);
            const isPending =
              feature.desiredState !== feature.reportedState;

            return ( 
              <div
                key={feature.featureId}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: "1rem",
                  opacity: isDeviceOffline ? 0.6 : 1,
                  background: isDeviceOffline ? "#f9fafb" : "#fff",
                  pointerEvents: isDeviceOffline ? "none" : "auto",
                }}>
                {/* ---------- ROW 1: NAME + STATUS ---------- */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 4,
                  }}>
                  <strong style={{ fontSize: 16 }}>{feature.name}</strong>
              
                  <span
                    style={{
                      padding: "2px 10px",
                      borderRadius: 999,
                      background: getFeatureBadge(feature).color,
                      color: "#fff",
                      fontSize: 12,
                    }}
                  >
                    {getFeatureBadge(feature).text}
                  </span>
                </div>
              
                {/* ---------- ROW 2: META ---------- */}
                <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>
                  {feature.type}
                  {feature.gpio !== null && (
                    <>
                      {" • "}
                      {(() => {
                        const pin = getGpioByValue(feature.gpio);
                        return pin ? `${pin.label} (${pin.type})` : `GPIO${feature.gpio}`;
                      })()}
                    </>
                  )}
                </div>
              
                {/* ------ ROW 3: CONTROLS ------- */}
                {feature.type !== "fan" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <ToggleSwitch
                      checked={feature.desiredState}
                      disabled={isPending || isDeviceOffline}
                      onChange={() => handleToggle(feature)}
                    />
                    <span style={{ fontSize: 13 }}>
                      {feature.desiredState ? "ON" : "OFF"}
                    </span>
                  </div>
                )}
              
                {/* ---------- FAN CONTROL ---------- */}
                {feature.type === "fan" && (
                  <div style={{ marginTop: 8 }}>
                    <label style={{ fontSize: 13 }}>
                      Speed: <strong>{feature.desiredLevel}</strong>
                    </label>
              
                    <input
                      type="range"
                      min={0}
                      max={5}
                      value={feature.desiredLevel}
                      disabled={
                        feature.desiredState !== feature.reportedState ||
                        currentDevice.status !== "online"
                      }
                      onChange={(e) =>
                        handleFanLevelChange(feature, Number(e.target.value))
                      }
                      style={{ width: "100%", marginTop: 4 }}
                    />
              
                    {feature.desiredState !== feature.reportedState && (
                      <div style={{ fontSize: 12, color: "#f59e0b", marginTop: 4 }}>
                        ⏳ Syncing with device…
                      </div>
                    )}
              
                    {feature.desiredLevel === 0 && (
                      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                        Move slider to turn ON
                      </div>
                    )}
                  </div>
                )}
              
                {/* ---------- ROW 4: ACTIONS ---------- */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "0.75rem",
                    marginTop: 12,
                  }}
                >
                  <button onClick={() => startEditFeature(feature)}>✏️ Edit</button>
                  <button onClick={() => handleDeleteFeature(feature.featureId)}>🗑️</button>
                </div>
              
                {/* ---------- EDIT MODE ---------- */}
                {editingFeatureId === feature.featureId && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: 12,
                      borderRadius: 8,
                      background: "#f8fafc",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    {/* your existing edit form stays here unchanged */}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </>
  );
};

export default DeviceDetails;