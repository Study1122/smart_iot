import { useState } from "react";
import { login } from "../services/auth";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await login(email, password);
    setMessage(res.message);

    if (res.success) {
      // Save token in localStorage
      localStorage.setItem("token", res.token);
      navigate("/dashboard");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{
        textAlign:"center",
        marginBottom: "1rem" 
      }}
      >Login</h1>
      <form
        onSubmit={handleLogin}
        style={{ display: "flex", flexDirection: "column", maxWidth: 300 }}
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ marginBottom: "0.5rem", padding: "0.5rem" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ marginBottom: "0.5rem", padding: "0.5rem" }}
        />
        <button type="submit" style={{ padding: "0.5rem" }}>Login</button>
      </form>

      <p style={{ marginTop: "1rem" }}>
        Don’t have an account? <Link to="/register">Register here</Link>
      </p>
      {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
    </div>
  );
};

export default Login;