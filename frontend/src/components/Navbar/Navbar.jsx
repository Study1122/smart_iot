import { useNavigate } from "react-router-dom";

const Navbar = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div
      style={{
        height: "60px",
        padding: "0 1.5rem",
        backgroundColor: "#1e293b",
        color: "#fff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h3>Smart IoT</h3>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <span>{user?.name}</span>
        <button
          onClick={handleLogout}
          style={{
            padding: "0.4rem 0.8rem",
            border: "none",
            backgroundColor: "skyblue",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;