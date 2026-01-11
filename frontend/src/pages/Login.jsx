import { useState, useEffect } from "react";
import { login, getMe } from "../services/auth";
import { useNavigate, Link } from "react-router-dom";
import { COLORS } from "../constants/colors";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [existingUser,setExistingUser] = useState(false);
  const navigate = useNavigate();
  
  //auto redirect if user already logged In
  useEffect(()=>{
    const checkLoggedInUser = async ()=>{
      const token = localStorage.getItem('token')
      if(!token) return;
      
      const res = await getMe();
      if(res.success){
        setExistingUser(res.success);
        navigate("/dashboard", {replace: true})
      }
    };
    checkLoggedInUser();
  }, [navigate]);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await login(email, password);
    setMessage(res.message);

    if (res.success) {
      localStorage.setItem("token", res.token);
      navigate("/dashboard");
    }
  };

  return (
    
    <div
      style={{
        minHeight: "100svh",
        display: "flex",
        justifyContent: "center",
        overflow: "hidden", //🔒 prevents keyboard scroll
        alignItems: "center",
        backgroundColor: COLORS.accentLight,
        padding: "1rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          padding: "2rem",
          borderRadius: 16,
          backgroundColor: COLORS.accentMedium,
          boxShadow: COLORS.shadowLightGray,
          border: `1px solid ${COLORS.accent}`,
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "1.5rem",
            color: COLORS.textPrimary,
          }}
        >
          Welcome Back
        </h1>

        <form
          onSubmit={handleLogin}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
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
              color: COLORS.bgPage,
              fontWeight: 600,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Login
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
          Don’t have an account?{" "}
          <Link
            to="/register"
            style={{ color: COLORS.primary, fontWeight: 600 }}
          >
            Register here
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

export default Login;