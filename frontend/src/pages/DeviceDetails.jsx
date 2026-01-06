import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getDeviceById,
  toggleFeature,
} from "../services/deviceService";
import {
  addFeature,
  updateFeatureMeta,
  deleteFeature,
} from "../services/deviceService";
import Navbar from "../components/Navbar/Navbar";
import { getMe } from "../services/auth";

const DeviceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // auth + device
  const [user, setUser] = useState(null);
  const [currentDevice, setCurrentDevice] = useState(null);

  // add feature
  const [showAddFeature, setShowAddFeature] = useState(false);
  const [newFeature, setNewFeature] = useState({
    featureId: "",
    name: "",
    type: "bulb",
  });

  // edit feature
  const [editingFeatureId, setEditingFeatureId] = useState(null);
  const [editFeatureData, setEditFeatureData] = useState({
    name: "",
    type: "bulb",
  });

  /* ---------------- TOGGLE FEATURE ---------------- */
  const handleToggle = async (feature) => {
    if (!currentDevice) return;

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
          f.featureId === featureId ? res.feature : f
        ),
      }));
      setEditingFeatureId(null);
    } else {
      alert(res.message);
    }
  };

  const cancelEditFeature = () => {
    setEditingFeatureId(null);
  };

  /* ---------------- DELETE FEATURE ---------------- */
  const handleDeleteFeature = async (featureId) => {
    const ok = window.confirm("Delete this feature?");
    if (!ok) return;

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
      return { text: "🟡 Pending", color: "#f59e0b" };
    }
    if (feature.reportedState) {
      return { text: "🟢 ON", color: "#16a34a" };
    }
    return { text: "🔴 OFF", color: "#dc2626" };
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

  if (!user || !currentDevice) return <p>Loading...</p>;

  /* ---------------- JSX ---------------- */
  return (
    <>
      <Navbar user={user} />

      <div style={{ maxWidth: "700px", margin: "2rem auto" }}>
        <h1>Device Details</h1>
        <p><strong>Name:</strong> {currentDevice.name}</p>
        <p><strong>Device ID:</strong> {currentDevice.deviceId}</p>
        <p>
          <strong>Status:</strong>{" "}
          {currentDevice.status === "online" ? "🟢 online" : "🔴 offline"}
        </p>
        <p><strong>Last Seen:</strong> {currentDevice.lastSeen || "Never"}</p>

        <h3 style={{ marginTop: "1.5rem" }}>Controls</h3>

        <button onClick={() => setShowAddFeature((v) => !v)}>
          ➕ Add Feature
        </button>

        {showAddFeature && (
          <div style={{
            marginTop: "0.75rem",
            padding: "0.75rem",
            border: "1px solid #ddd",
            borderRadius: "6px",
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}>
            <input
              style={{ flex: "1 1 200px" }}
              placeholder="(Unique⚠) Feature ID (e.g. bulb-1)"
              value={newFeature.featureId}
              onChange={(e) =>
                setNewFeature({ ...newFeature, featureId: e.target.value })
              }
            />
            <input
              style={{ flex: "1 1 200px" }}
              placeholder="Name (e.g. Bedroom/ Hall)"
              value={newFeature.name}
              onChange={(e) =>
                setNewFeature({ ...newFeature, name: e.target.value })
              }
            />
            <select
              style={{ flex: "1 1 160px" }}
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

        <ul 
          style={{ 
            listStyle: "none",
            margin: ".5rem", 
            padding: "0 .5rem",
            
          }}>
          {currentDevice.features.map((feature) => {
            const badge = getFeatureBadge(feature);
            const isPending =
              feature.desiredState !== feature.reportedState;

            return (
              <li
                key={feature.featureId}
                style={{
                  border: "1px solid gray",
                  margin: ".5rem 0",
                  padding: "1.5rem 1rem",
                  borderRadius: ".5rem"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>
                    {feature.name} ({feature.type})
                  </span>

                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        background: badge.color,
                        color: "#fff",
                        borderRadius: "10px",
                      }}
                    >
                      {badge.text}
                    </span>

                    <button
                      disabled={isPending}
                      onClick={() => handleToggle(feature)}
                    >
                      Toggle
                    </button>

                    <button onClick={() => startEditFeature(feature)}>✏️</button>
                    <button onClick={() => handleDeleteFeature(feature.featureId)}>
                      🗑️
                    </button>
                  </div>
                </div>

                {editingFeatureId === feature.featureId && (
                  <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
                    <input
                      value={editFeatureData.name}
                      onChange={(e) =>
                        setEditFeatureData({
                          ...editFeatureData,
                          name: e.target.value,
                        })
                      }
                    />
                    <select
                      value={editFeatureData.type}
                      onChange={(e) =>
                        setEditFeatureData({
                          ...editFeatureData,
                          type: e.target.value,
                        })
                      }
                    >
                      <option value="bulb">Bulb</option>
                      <option value="fan">Fan</option>
                      <option value="switch">Switch</option>
                    </select>
                    <button onClick={() => saveEditFeature(feature.featureId)}>
                      Save
                    </button>
                    <button onClick={cancelEditFeature}>Cancel</button>
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

export default DeviceDetails;