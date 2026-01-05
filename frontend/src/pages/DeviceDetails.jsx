import { useParams } from "react-router-dom";

const DeviceDetails = () => {
  const { id } = useParams();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Device Details Page</h1>
      <p>Device ID: {id}</p>
    </div>
  );
};

export default DeviceDetails;