import { COLORS } from "../../constants/colors";
import { useNavigate } from "react-router-dom";

const Navbar = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header
      style={{
        height: 64,
        padding: "0 1.25rem",
        background: COLORS.bgNavbar,
        color: COLORS.textInverse,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: COLORS.shadowMedium,
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* LEFT: BRAND */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          cursor: "pointer",
        }}
        onClick={() => navigate("/dashboard")}
      >
        <span style={{ fontSize: 22 }}>📡</span>
        <h3 style={{ margin: 0, fontWeight: 700 }}>Smart IoT</h3>
      </div>

      {/* RIGHT: USER + ACTION */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <span
          style={{
            fontSize: 14,
            opacity: 0.9,
            maxWidth: 120,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={user?.name}
        >
          👤 {user?.name}
        </span>

        <button
          onClick={handleLogout}
          style={{
            padding: "0.45rem 0.9rem",
            borderRadius: 8,
            border: "none",
            background: COLORS.error,
            color: COLORS.textSecondary,
            fontWeight: 600,
            cursor: "pointer",
            transition: "transform 0.1s, opacity 0.1s",
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;