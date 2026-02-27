import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { login, isAdmin } = useContext(AuthContext);

  const handleLogin = (e) => {
    e.preventDefault();

    const res = login(email, password);

    if (!res.ok) {
      alert(res.message);
      return;
    }

    alert("Login Successful!");

    // 🔐 Admin → show CRUD pages
    if (email === "admin@nitttrc.com") {
      navigate("/head");   // admin route
    } else {
      navigate("/");       // normal page (if needed later)
    }
  };

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleLogin}>
        <h2>NITTTRC Login</h2>

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;