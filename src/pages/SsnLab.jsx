import { Link } from "react-router-dom";
import "./SsnLab.css";

function SsnLab() {
  const sections = [
    { heading: "Resource", desc: "Available resources in the lab.", route: "/ssnlab/resource" },
    { heading: "Data Collection", desc: "Research and experimental data.", route: "/ssnlab/datacollection" },
    { heading: "Facilities", desc: "Lab infrastructure and equipment.", route: "/ssnlab/facilities" },
    { heading: "Event", desc: "Workshops, seminars, and events.", route: "/ssnlab/event" }
  ];

  return (
    <div className="ssnlab-page">
      
      {/* 🔥 BACKGROUND VIDEO */}
      <div className="video-container">
        <video autoPlay loop muted playsInline className="bg-video">
          <source src="/video1.mp4" type="video/mp4" />
        </video>
      </div>

      {/* 🔥 CONTENT */}
      <div className="ssnlab-content">
        <div className="ssnlab-outer-container">
          <h2 className="ssnlab-title">SSN Lab Sections</h2>

          <div className="ssnlab-inner-container">
            {sections.map((sec, index) => (
              <Link to={sec.route} className="ssnlab-link" key={index}>
                <div className="ssnlab-card">
                  <h3>{sec.heading}</h3>
                  <p>{sec.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

export default SsnLab;