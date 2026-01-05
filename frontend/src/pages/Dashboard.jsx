import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe } from "../services/auth";
import { getUserDevices } from "../services/device";
import Navbar from "../components/Navbar/Navbar";
const Dashboard = () => {
  
  const [user, setUser] = useState(null);
  const [devices, setDevices] = useState([]);
  
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

        <ul>
          {devices.map((device) => (
            <li key={device._id} style={{ margin: "0.5rem 0" }}
            onClick={() => navigate(`/device/${device._id}`)}>
              <strong>{device.name}</strong> — {device.deviceId}
            </li>
          ))}
        </ul>
      </div>
    </>
    
  );
};

export default Dashboard;