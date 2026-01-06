import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  getDeviceById,
  addFeature,
  toggleFeature,
} from "../services/device";
import Navbar from "../components/Navbar/Navbar";
import { getMe } from "../services/auth";

const DeviceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [device, setDevice] = useState(null);
  const [showAddFeature, setShowAddFeature] = useState(false);
  const [newFeature, setNewFeature] = useState({
    featureId: "",
    name: "",
    type: "bulb",
  });
  
  //HANDLE TOGGEL
  const handleToggle = async (feature) => {
    if (!device) return;
    const res = await toggleFeature(
      device._id, 
      feature.featureId, 
      !feature.desiredState
    );
  
    if (res.success) {
      // update UI immediately
      setDevice((prev) => ({
        ...prev,
        features: prev.features.map((f) =>
          f.featureId === feature.featureId ? { ...f, desiredState: !f.desiredState } : f
        ),
      }));
    }
  };
  
  //HANDLE ADD FEATURES
  const handleAddFeature = async () => {
    if(!device) return;
    if (!newFeature.featureId.trim() || !newFeature.name.trim()) {
      alert("Feature ID and Name are required");
      return;
    }
  
    const res = await addFeature(device._id, newFeature);
  
    if (res.success) {
      setDevice((prev) => ({
        ...prev,
        features: res.features,
      }));
  
      setShowAddFeature(false);
      setNewFeature({ featureId: "", name: "", type: "bulb" });
    } else {
      alert(res.message);
    }
  };
  
  //badge update helper
  const getFeatureBadge = (feature) => {
    if (feature.desiredState !== feature.reportedState) {
      return { text: "🟡 Pending", color: "#f59e0b" };
    }
    if (feature.reportedState) {
      return { text: "🟢 ON", color: "#16a34a" };
    }
    return { text: "🔴 OFF", color: "#dc2626" };
  };
    
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
        setDevice(deviceRes.device);
      }
    };
    fetchData()
    // 🔄 poll every 5 seconds
    intervalId = setInterval(fetchData, 5000);
  
    return () => clearInterval(intervalId); // cleanup
  }, [id, navigate]);

  if (!user || !device) return <p>Loading...</p>;

  return (
    <>
      <Navbar user={user} />

      <div style={{ maxWidth: "700px", margin: "2rem auto" }}>
        <h1>Device Details</h1>

        <p><strong>Name:</strong> {device.name}</p>
        <p><strong>Device ID:</strong> {device.deviceId}</p>
        <p><strong>Status:</strong> {device.status === "online" ? "🟢 online"  : "🔴 offline"}</p>
        <p><strong>Last Seen:</strong> {device.lastSeen || "Never"}</p>
      </div>
      
      <h3 style={{ marginTop: "1.5rem" }}>Controls</h3>
      {/* add features ui */}
      
      {device && (
        <button onClick={() => setShowAddFeature((v) => !v)}>
          ➕ Add Feature
        </button>
      )}
      
      {showAddFeature && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "0.75rem",
            border: "1px solid #ddd",
            borderRadius: "6px",
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          <input
            placeholder="Feature ID (e.g. bulb1)"
            value={newFeature.featureId}
            onChange={(e) =>
              setNewFeature({ ...newFeature, featureId: e.target.value })
            }
          />
      
          <input
            placeholder="Feature Name"
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
      {device.features?.length === 0 && <p>No features added.</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {device.features.map((feature) => {
          const badge = getFeatureBadge(feature);
          const isPending = feature.desiredState !== feature.reportedState;
      
          return (
            <li
              key={feature.featureId}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                margin: "0.5rem 0",
                padding: "0.5rem 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <span>
                {feature.type === "bulb" ? "💡" : feature.type === "fan" ? "🌀" : "🔘"}{" "}
                {feature.name}
              </span>
      
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    color: "#fff",
                    backgroundColor: badge.color,
                  }}
                >
                  {badge.text}
                </span>
      
                <button
                  onClick={() => handleToggle(feature)}
                  disabled={isPending} // 🔒 optional safety
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "none",
                    cursor: isPending ? "not-allowed" : "pointer",
                    opacity: isPending ? 0.6 : 1,
                  }}
                >
                  Toggle
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default DeviceDetails;
