import React, { useState } from "react";
import "./AwardPage.css";

const INITIAL_STUDENT_AWARDS = [
  { title: "Sathya Priya R, Muthumeenakshi K & Sakthivel Murugan S. - Best Paper Award (ICAIO 2025)", year: "2025" },
  { title: "Team KYOGRE - Won Smart India Hackathon (SIH) Software Edition", year: "2022" },
  { title: "Ms. Nivedhitha & Mr. Karthick - Won IEEE R10 UG Student Video Competition", year: "2021" },
  { title: "Mary Cecilia S. - Best Paper Award (ICITSD-2021)", year: "2021" },
  { title: "Sukanthi Kannan - Best Paper Award (NCICT 2020)", year: "2020" },
  { title: "Mubeena Parveen - Best Paper Award (NCICT 2020)", year: "2020" },
  { title: "K. Balaji - Best Oral Presenter Award (CESS-GS IIT Kharagpur)", year: "2020" },
  { title: "M. Vimalraj - Best Oral Presenter Award (CESS-GS IIT Kharagpur)", year: "2020" },
  { title: "S. Mary Cecilia - Best Paper Award (SYMPOL 2019)", year: "2019" },
  { title: "G. Annalakshmi - Best Participant Award (IIITDM Workshop)", year: "2019" },
  { title: "S. Swathi - Best Paper Award (ICETSE 2017)", year: "2017" },
  { title: "Hasthi Gowthami - Best Paper Award (ICETSE 2017)", year: "2017" },
  { title: "S. Swathi - Best Poster Presentation Award (IISF 2016)", year: "2016" }
];

const INITIAL_FACULTY_AWARDS = [
  { title: "Best Teacher Award (Academic Year 2023-2024 from SSNCE)", year: "2024" },
  { title: "Auditor for Academic & Administrative Audit (Sairam Engineering College)", year: "2024" },
  { title: "Best Teacher Award (Academic Year 2021-2022 from SSNCE)", year: "2022" },
  { title: "Best Teacher Award (Academic Year 2018-2019 from SSNCE)", year: "2019" },
  { title: "Cognizant's Best Faculty Award (Overall College Category)", year: "2019" },
  { title: "Redington Foundation Best Teacher Award", year: "2018" },
  { title: "Best Poster Award (4th Int. Conference on Oceanography and Marine Biology)", year: "2016" },
  { title: "Young Researcher Award (VIFFA 2015 - Venus International Foundation)", year: "2015" },
  { title: "Best Paper Award (IEEE INDICON 2015)", year: "2015" },
  { title: "Best Paper Award (ISTE Regional Conference)", year: "2015" },
  { title: "Best Oral Presenter Award (ICCSN 2014, Singapore)", year: "2014" },
  { title: "Best Paper Award (Springer ICAEES 2014)", year: "2014" },
  { title: "Best Teacher Award (Academic Year 2010-2011 from SSNCE)", year: "2011" }
];

export default function AwardPage() {
  const [studentAwards, setStudentAwards] = useState(INITIAL_STUDENT_AWARDS);
  const [facultyAwards, setFacultyAwards] = useState(INITIAL_FACULTY_AWARDS);

  const [studentTitle, setStudentTitle] = useState("");
  const [studentYear, setStudentYear] = useState("");

  const [facultyTitle, setFacultyTitle] = useState("");
  const [facultyYear, setFacultyYear] = useState("");

  const addStudentAward = () => {
    if (!studentTitle || !studentYear) return;
    setStudentAwards([...studentAwards, { title: studentTitle, year: studentYear }]);
    setStudentTitle("");
    setStudentYear("");
  };

  const addFacultyAward = () => {
    if (!facultyTitle || !facultyYear) return;
    setFacultyAwards([...facultyAwards, { title: facultyTitle, year: facultyYear }]);
    setFacultyTitle("");
    setFacultyYear("");
  };

  const deleteStudent = (index) => {
    setStudentAwards(studentAwards.filter((_, i) => i !== index));
  };

  const deleteFaculty = (index) => {
    setFacultyAwards(facultyAwards.filter((_, i) => i !== index));
  };

  return (
    <div className="page">
      <h1 className="mainTitle">🏆 Awards & Recognition</h1>
      <p className="subtitle">
        Celebrating achievements and excellence of our students and faculty
      </p>

      <div className="container">
        
        {/* Student Awards Card */}
        <div className="card">
          <h2 className="sectionTitle">🎓 Student Awards</h2>

          <div className="awardList">
            {studentAwards.map((award, index) => (
              <div key={index} className="awardItem">
                <div className="awardText">
                  <span className="awardTitle">{award.title}</span>
                  {award.year && <span className="awardYear"> ({award.year})</span>}
                </div>
                <button className="deleteBtn" onClick={() => deleteStudent(index)}>
                  Delete
                </button>
              </div>
            ))}
          </div>

          <div className="inputArea">
            <input
              placeholder="Award Title"
              value={studentTitle}
              onChange={(e) => setStudentTitle(e.target.value)}
              className="input"
            />
            <input
              placeholder="Year"
              value={studentYear}
              onChange={(e) => setStudentYear(e.target.value)}
              className="input"
            />
            <button className="addBtn" onClick={addStudentAward}>
              Add Award
            </button>
          </div>
        </div>

        {/* Faculty Awards Card */}
        <div className="card">
          <h2 className="sectionTitle">👨‍🏫 Faculty Awards</h2>

          {facultyAwards.length === 0 && (
            <p className="emptyText">No awards added yet</p>
          )}

          <div className="awardList">
            {facultyAwards.map((award, index) => (
              <div key={index} className="awardItem">
                <div className="awardText">
                  <span className="awardTitle">{award.title}</span>
                  {award.year && <span className="awardYear"> ({award.year})</span>}
                </div>
                <button className="deleteBtn" onClick={() => deleteFaculty(index)}>
                  Delete
                </button>
              </div>
            ))}
          </div>

          <div className="inputArea">
            <input
              placeholder="Award Title"
              value={facultyTitle}
              onChange={(e) => setFacultyTitle(e.target.value)}
              className="input"
            />
            <input
              placeholder="Year"
              value={facultyYear}
              onChange={(e) => setFacultyYear(e.target.value)}
              className="input"
            />
            <button className="addBtn" onClick={addFacultyAward}>
              Add Award
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}