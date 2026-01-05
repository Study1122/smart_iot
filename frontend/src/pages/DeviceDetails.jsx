import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDeviceById } from "../services/device";
import { toggleFeature } from "../services/device";
import Navbar from "../components/Navbar/Navbar";
import { getMe } from "../services/auth";

const DeviceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [device, setDevice] = useState(null);
  
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
