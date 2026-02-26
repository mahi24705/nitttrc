import "./Head.css";
import { Link } from "react-router-dom";
import {
  FaInstagram,
  FaPhone,
  FaEnvelope,
  FaLinkedin,
  FaMapMarkerAlt,
} from "react-icons/fa";

function Head() {
  return (
    <div className="video-container">
      {/* 🎥 BACKGROUND VIDEO */}
      <video autoPlay loop muted playsInline className="bg-video">
        <source src="/video 3.mp4" type="video/mp4" />
      </video>

      {/* 🌊 OVERLAY */}
      <div className="overlay">
        {/* CONTENT */}
        <div className="head-container">
          <div className="hero">
            {/* LEFT */}
            <div className="left">
              <h1 className="title">Dr. S. Sakthivel Murugan</h1>

              <h2 className="animated-text">
                Associate Professor, Department of ECE
              </h2>

              <p>
                Highlight the magical and breathtaking experience awaiting
                underwater, making visitors eager to explore.
              </p>

              {/* ✅ CLICKABLE LINK (NO BUTTON NESTING) */}
              <Link to="/" className="explore-link">
                Explore Now →
              </Link>

              <div className="icons">
                <span><FaInstagram /> @divein</span>
                <span><FaPhone /> +91 9486430142</span>
                <span><FaEnvelope /> sakthivelmurugan@gmail.com</span>
                <span><FaLinkedin /> linkedin.com/in/divein</span>
                <span><FaMapMarkerAlt /> Chennai</span>
              </div>
            </div>

            {/* RIGHT */}
            <div className="right">
              <img
                src="/profile1.jpeg"
                alt="profile"
                className="profile-img"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Head;