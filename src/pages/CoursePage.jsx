import { useLocation, useNavigate } from "react-router-dom";
import "./CoursePage.css";

export default function CoursePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const isPdpPage = location.pathname === "/course/pdp";

  return (
    <div className="nitt-wrap">
      <div className="nitt-head">
        <h1 className="nitt-title">{isPdpPage ? "PDP" : "Course"}</h1>
        <p className="nitt-sub">Select a section to continue</p>
      </div>

      {/* ✅ SAME GRID STYLE AS NITTTRC SELECTION PAGE */}
      <div className="nitt-grid">
        {!isPdpPage ? (
          <>
            <button className="nitt-card" onClick={() => navigate("/course/pdp")}>
              <div className="nitt-card-title">PDP</div>
              <div className="nitt-card-sub">PDP Programmes</div>
            </button>

            <button className="nitt-card" onClick={() => alert("PG page coming soon")}>
              <div className="nitt-card-title">PG</div>
              <div className="nitt-card-sub">Post Graduate</div>
            </button>

            <button className="nitt-card" onClick={() => alert("ITEC page coming soon")}>
              <div className="nitt-card-title">ITEC</div>
              <div className="nitt-card-sub">ITEC Programmes</div>
            </button>

            <button
              className="nitt-card"
              onClick={() => alert("Host Institution page coming soon")}
            >
              <div className="nitt-card-title">Host Institution</div>
              <div className="nitt-card-sub">Host Institution Work</div>
            </button>
          </>
        ) : (
          <>
            {/* ✅ PDP page should show your OLD 2 boxes style */}
            <button className="nitt-card" onClick={() => navigate("/as-coordinator")}>
              <div className="nitt-card-title">AS Coordinator</div>
              <div className="nitt-card-sub">Coordinator Activities</div>
            </button>

            <button className="nitt-card" onClick={() => navigate("/pdp-resource")}>
              <div className="nitt-card-title">Resource Person</div>
              <div className="nitt-card-sub">PDP / ITEC Programmes</div>
            </button>
          </>
        )}
      </div>
    </div>
  );
}