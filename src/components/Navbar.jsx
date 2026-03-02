import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { isAdmin, logout } = useContext(AuthContext);

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>NITTTRC Portal</div>

      <div>
        <Link style={styles.link} to="/">Home</Link>
        <Link style={styles.link} to="/nitttrc">NITTTRC</Link>
        <Link style={styles.link} to="/ssnlab">SSN Lab</Link>
        <Link style={styles.link} to="/head">Head</Link>

        {!isAdmin ? (
          <Link style={styles.loginBtn} to="/login">Login</Link>
        ) : (
          <button style={styles.logoutBtn} onClick={logout}>Logout</button>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 50px",
    backgroundColor: "#0A2E5C",
    color: "white"
  },
  logo: {
    fontSize: "20px",
    fontWeight: "bold"
  },
  link: {
    marginLeft: "20px",
    color: "white",
    textDecoration: "none",
    fontWeight: "500"
  },
  loginBtn: {
    marginLeft: "20px",
    padding: "8px 15px",
    backgroundColor: "white",
    color: "#0A2E5C",
    textDecoration: "none",
    borderRadius: "5px",
    fontWeight: "bold"
  },
  logoutBtn: {
    marginLeft: "20px",
    padding: "8px 15px",
    backgroundColor: "white",
    color: "#0A2E5C",
    border: "none",
    borderRadius: "5px",
    fontWeight: "bold",
    cursor: "pointer"
  }
};

export default Navbar;