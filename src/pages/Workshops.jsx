import React, { useState } from "react";
import "./AsCoordinator.css"; // Imports your provided CSS file

// Formatted Data based on your provided list
const initialWorkshops = [
  // --- WORKSHOPS ORGANIZED ---
  { id: 1, group: "WORKSHOPS ORGANIZED", code: "SSNCE", title: "Workshop on Engineering Principles in Nano Technology", duration: "23.07.2011", mode: "Contact" },
  { id: 2, group: "WORKSHOPS ORGANIZED", code: "SSNCE", title: "Two Day Workshop on ARM mbed Cortex M Processor Platform", duration: "20.09.2013 - 21.09.2013", mode: "Contact" },
  { id: 3, group: "WORKSHOPS ORGANIZED", code: "SSNCE", title: "Virtual workshop on Ocean Observation and Hydrographic Surveying", duration: "18.08.2020", mode: "Online" },
  { id: 4, group: "WORKSHOPS ORGANIZED", code: "SSNCE", title: "International Workshop on Understanding Oceans and Exploration of Deep-Sea Bio Resources by technology", duration: "25.08.2020", mode: "Online" },
  { id: 5, group: "WORKSHOPS ORGANIZED", code: "SSNCE", title: "International Workshop on Underwater Vehicle – Communication, Navigation and Control", duration: "01.09.2020", mode: "Online" },
  { id: 6, group: "WORKSHOPS ORGANIZED", code: "SSNCE", title: "Two-day workshop with Alumni for future Alumni V 5.0", duration: "05.08.2021 - 06.08.2021", mode: "Contact" },
  { id: 7, group: "WORKSHOPS ORGANIZED", code: "SSNCE", title: "International Workshop on Current Trends and Future Directions in Underwater Communication", duration: "17.02.2022 - 18.02.2022", mode: "Contact" },
  { id: 8, group: "WORKSHOPS ORGANIZED", code: "SSNCE", title: "International Workshop on Ocean Observation Systems and Underwater Marine Resources", duration: "16.03.2022 - 17.03.2022", mode: "Contact" },

  // --- WORKSHOPS ATTENDED ---
  { id: 9, group: "WORKSHOPS ATTENDED", code: "Anna Univ & ASI", title: "National Workshop on University initiatives for Micro-Satellite Development", duration: "09.03.2002", mode: "Contact" },
  { id: 10, group: "WORKSHOPS ATTENDED", code: "SSNCE", title: "Faculty Development program workshop on LIFE SKILLS", duration: "20.11.2006 - 22.11.2006", mode: "Contact" },
  { id: 11, group: "WORKSHOPS ATTENDED", code: "SSNCE", title: "One day workshop on simulation of electronic circuit using Orchad", duration: "03.03.2007", mode: "Contact" },
  { id: 12, group: "WORKSHOPS ATTENDED", code: "St. Joseph’s CE", title: "National workshop on ‘Optical communication and networking”", duration: "10.08.2007 - 11.08.2007", mode: "Contact" },
  { id: 13, group: "WORKSHOPS ATTENDED", code: "SSNCE", title: "Two days workshop on wireless sensor networks", duration: "18.04.2008 - 19.04.2008", mode: "Contact" },
  { id: 14, group: "WORKSHOPS ATTENDED", code: "SRM Univ", title: "International Workshop on recent advances in Microwave and Optical Communication technology", duration: "21.12.2009", mode: "Contact" },
  { id: 15, group: "WORKSHOPS ATTENDED", code: "IIITDM", title: "Five day workshop on “Artificial Intelligence for ALL”", duration: "17.06.2019 - 21.06.2019", mode: "Contact" },
];

export default function Workshop() {
  const [searchTerm, setSearchTerm] = useState("");
  const [workshops, setWorkshops] = useState(initialWorkshops);

  // Search Filter logic
  const filteredWorkshops = workshops.filter(
    (w) =>
      w.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Grouping logic 
  const groupedData = filteredWorkshops.reduce((acc, curr) => {
    if (!acc[curr.group]) acc[curr.group] = [];
    acc[curr.group].push(curr);
    return acc;
  }, {});

  const handleDelete = (id) => {
    setWorkshops(workshops.filter((w) => w.id !== id));
  };

  const handleReset = () => {
    setSearchTerm("");
  };

  return (
    <div className="page">
      {/* HEADER SECTION */}
      <div className="hero">
        <div>
          <h1>Workshops Organized & Attended</h1>
          <p>Academic & Industry Training Programs</p>
        </div>
        <div className="hero-right">
          <input
            type="text"
            className="search"
            placeholder="Search: title / location / date"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="ghost" style={{ background: "#fff" }} onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>

      <div className="content" style={{ marginTop: "24px" }}>
        {Object.keys(groupedData).length === 0 && (
          <div className="empty">No records found.</div>
        )}

        {/* MAP THROUGH GROUPS */}
        {Object.keys(groupedData).map((groupName) => (
          <div className="group" key={groupName}>
            <div className="group-head">
              <span className="group-date">{groupName}</span>
              <span className="group-count">
                {groupedData[groupName].length} Session
                {groupedData[groupName].length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="table">
              {/* TABLE HEADER */}
              <div className="tr head">
                <div>S.NO</div>
                <div>CONDUCTED BY</div>
                <div>TITLE</div>
                <div>DATE</div>
                <div>MODE</div>
                <div>ACTION</div>
              </div>

              {/* TABLE ROWS */}
              {groupedData[groupName].map((item, index) => (
                <div className="tr" key={item.id}>
                  <div className="muted">{index + 1}</div>
                  <div className="code">{item.code}</div>
                  <div className="programme">{item.title}</div>
                  <div className="muted">{item.duration}</div>
                  <div>
                    <span className={`pill ${item.mode.toLowerCase()}`}>
                      {item.mode}
                    </span>
                  </div>
                  <div className="actions">
                    <button className="edit">Edit</button>
                    <button className="del" onClick={() => handleDelete(item.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}