import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  const cards = [
    { heading: "Course", desc: "Others & Theoretical", route: "/course" },
    { heading: "Network Incharge", desc: "Collaborations & Work", route: "/network" },
    { heading: "Audio Incharge", desc: "Speeches & Sessions", route: "/audioincharge" },
    { heading: "Award & Recognition", desc: "Achievements & Honors", route: "/award" },
    { heading: "Outside", desc: "Collaborations & International Work", route: "/outsideworld" },
    { heading: "Publication", desc: "Research Publications", route: "/publication" },
    { heading: "Board of Studies", desc: "Research Publications", route: "/boardofstudies" },
    { heading: "DC", desc: "Research Publications", route: "/dc" },
    { heading: "Gallery", desc: "Research Publications", route: "/gallery" }
  ];

  return (
    <div className="home-page">

      {/* 🎥 BACKGROUND VIDEO */}
      <video autoPlay loop muted playsInline className="bg-video">
        <source src="/Video 2.mp4" type="video/mp4" />
      </video>

      {/* 🌊 CONTENT */}
      <div className="overlay">
        <div className="outer-container">
          <h2 className="title">NITTTRC Sections</h2>

          <div className="inner-container">
            {cards.map((card, index) => (
              <Link to={card.route} className="card-link" key={index}>
                <div className="card">
                  <h3>{card.heading}</h3>
                  <p>{card.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

export default Home;