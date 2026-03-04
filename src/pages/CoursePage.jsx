import { useLocation, useNavigate } from "react-router-dom";
import "./CoursePage.css";

export default function CoursePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const isPdpPage = location.pathname === "/course/pdp";

  return (
    <div className="nitt-wrap">
      <div className="nitt-head">
        <h1 className="nitt-title">{isPdpPage ? "PDP" : "Courses"}</h1>

        {/* ✅ Subtitle changes based on page */}
        <p className="nitt-sub">
          {isPdpPage
            ? "Professional Development Programmes (PDP)"
            : "Select a section to continue"}
        </p>
      </div>

      <div className="nitt-grid">
        {!isPdpPage ? (
          <>
            {/* PDP */}
            <button
              className="nitt-card"
              onClick={() => navigate("/course/pdp")}
            >
              <div className="nitt-card-title">PDP</div>
              <div className="nitt-card-sub">
                Professional Development Programmes (PDP)
              </div>
            </button>

            {/* PG */}
            <button
              className="nitt-card"
              onClick={() => navigate("/pg")}
            >
              <div className="nitt-card-title">PG</div>
              <div className="nitt-card-sub">
                M.Tech / VLSI / Embedded system
              </div>
            </button>

            {/* ITEC */}
            <button
              className="nitt-card"
              onClick={() => navigate("/itec")}
            >
              <div className="nitt-card-title">ITEC</div>
              <div className="nitt-card-sub">ITEC Programmes</div>
            </button>

            {/* Host Institution */}
            <button
              className="nitt-card"
              onClick={() => navigate("/host-institution")}
            >
              <div className="nitt-card-title">Host Institution</div>
              <div className="nitt-card-sub">Host Institution Work</div>
            </button>

            {/* ITP */}
            <button
              className="nitt-card"
              onClick={() => navigate("/itp")}
            >
              <div className="nitt-card-title">ITP</div>
              <div className="nitt-card-sub">
                Industrial Training Program
              </div>
            </button>
          </>
        ) : (
          <>
            {/* PDP INNER PAGE */}
            <button
              className="nitt-card"
              onClick={() => navigate("/as-coordinator")}
            >
              <div className="nitt-card-title">As Coordinator</div>
            </button>

            <button
              className="nitt-card"
              onClick={() => navigate("/pdp-resource")}
            >
              <div className="nitt-card-title">As Resource Person</div>
             
            </button>
          </>
        )}
      </div>
    </div>
  );
}