import { useState } from "react";
import { register } from "../services/auth";
import { useNavigate, Link } from "react-router-dom";
import { COLORS } from "../constants/colors";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    const res = await register(name, email, password);
    setMessage(res.message);
    if (res.success) {
      navigate("/login");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.bgPage,
        padding: "1rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          padding: "2rem",
          borderRadius: 16,
          backgroundColor: COLORS.bgCard,
          boxShadow: COLORS.shadowMedium,
          border: `1px solid ${COLORS.borderLight}`,
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "1.5rem",
            color: COLORS.textPrimary,
          }}
        >
          Create Account
        </h1>

        <form
          onSubmit={handleRegister}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={inputStyle}
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />

          <button
            type="submit"
            style={{
              marginTop: "0.5rem",
              padding: "0.6rem",
              borderRadius: 8,
              border: "none",
              backgroundColor: COLORS.primary,
              color: COLORS.textInverse,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Register
          </button>
        </form>

        <p
          style={{
            marginTop: "1rem",
            fontSize: 14,
            textAlign: "center",
            color: COLORS.textSecondary,
          }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{ color: COLORS.primary, fontWeight: 600 }}
          >
            Login here
          </Link>
        </p>

        {message && (
          <p
            style={{
              marginTop: "1rem",
              fontSize: 13,
              textAlign: "center",
              color: COLORS.error,
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

/* =========================
   Reusable input style
========================= */
const inputStyle = {
  width: "100%",
  padding: "0.55rem",
  borderRadius: 8,
  border: `1px solid ${COLORS.borderLight}`,
  fontSize: 14,
  outline: "none",
};

export default Register;