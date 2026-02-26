import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // 🔥 get login function

  const handleLogin = (e) => {
    e.preventDefault();

    // ✅ Admin Login
    if (email === "admin@nitttrc.com" && password === "1234") {

      const userData = {
        name: "Admin",
        role: "admin"
      };

      login(userData);  // 🔥 save in context
      alert("Admin Login Successful!");

      navigate("/head"); // go to Head page
    }

    // ✅ Normal User (optional)
    else if (email === "user@nitttrc.com" && password === "1234") {

      const userData = {
        name: "User",
        role: "user"
      };

      login(userData);
      alert("User Login Successful!");

      navigate("/");
    }

    else {
      alert("Invalid Credentials");
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
