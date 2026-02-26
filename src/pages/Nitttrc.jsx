import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import "./Nitttrc.css";

function Nitttrc() {
  const { user } = useContext(AuthContext);

  const [activeSection, setActiveSection] = useState("");
  const [input, setInput] = useState("");
  const [data, setData] = useState({});

  const sections = [
    { key: "course", title: "Course", desc: "Others & Theoretical" },
    { key: "networking", title: "Networking", desc: "Collaborations & Work" },
    { key: "audio", title: "Audio Incharge", desc: "Speeches & Sessions" },
    { key: "award", title: "Award & Recognition", desc: "Achievements & Honors" },
    { key: "outside", title: "Outside World Interaction", desc: "Collaborations & International Work" },
    { key: "publication", title: "Publication", desc: "Research Publications" }
  ];

  // Load saved data
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("nitttrcData")) || {};
    setData(saved);
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem("nitttrcData", JSON.stringify(data));
  }, [data]);

  const handleAdd = () => {
    if (!input) return;

    const updated = {
      ...data,
      [activeSection]: [...(data[activeSection] || []), input]
    };

    setData(updated);
    setInput("");
  };

  const handleDelete = (index) => {
    const updatedList = data[activeSection].filter((_, i) => i !== index);

    const updated = {
      ...data,
      [activeSection]: updatedList
    };

    setData(updated);
  };

  return (
    <div className="container">
      <h2 className="title">NITTTRC Activities</h2>

      {/* ===== OUTER CARDS ===== */}
      <div className="card-container">
        {sections.map((sec) => (
          <div
            key={sec.key}
            className={`card ${activeSection === sec.key ? "active" : ""}`}
            onClick={() => setActiveSection(sec.key)}
          >
            <h3>{sec.title}</h3>
            <p>{sec.desc}</p>
          </div>
        ))}
      </div>

      {/* ===== CONTENT BOX ===== */}
      {activeSection && (
        <div className="content-box">
          <h3>{sections.find(s => s.key === activeSection)?.title}</h3>

          <ul>
            {(data[activeSection] || []).map((item, index) => (
              <li key={index}>
                {item}
                {user?.role === "admin" && (
                  <button className="delete-btn" onClick={() => handleDelete(index)}>
                    Delete
                  </button>
                )}
              </li>
            ))}
          </ul>

          {user?.role === "admin" && (
            <div className="admin-box">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Add content..."
              />
              <button onClick={handleAdd}>Add</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Nitttrc;