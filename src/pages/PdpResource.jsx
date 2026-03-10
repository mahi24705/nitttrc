import { useMemo, useState, useContext } from "react";
import "./PdpResource.css";
import { AuthContext } from "../context/AuthContext";

const INITIAL_DATA = [
  // MAR 2026
  { id: 1, date: "12.03.2026", sessionDate: "12.03.2026", code: "NULL", title: "Measurement and Control for Industrial Automation", duration: "09.03.2026 - 13.03.2026", mode: "Contact" },
  { id: 2, date: "12.03.2026", sessionDate: "12.03.2026", code: "NULL", title: "Autonomous Systems and its Applications", duration: "09.03.2026 - 13.03.2026", mode: "Contact" },
  { id: 3, date: "19.03.2026", sessionDate: "19.03.2026", code: "NULL", title: "Transformative Engineering Education Through Design Thinking and EdTech Integration", duration: "16.03.2026 - 20.03.2026", mode: "Contact" },
  // FEB 2026
  { id: 4, date: "13.02.2026", sessionDate: "13.02.2026", code: "ITP-14", title: "Industrial Training Programme for EIE and ECE", duration: "02.02.2026 - 20.02.2026", mode: "Contact" },
  { id: 5, date: "12.02.2026", sessionDate: "12.02.2026", code: "ME-37-364", title: "Industrial Mechatronics", duration: "09.02.2026 - 13.02.2026", mode: "Contact" },
  { id: 6, date: "04.02.2026", sessionDate: "04.02.2026", code: "ITP-14", title: "Industrial Training Programme for EIE and ECE", duration: "02.02.2026 - 20.02.2026", mode: "Contact" },
  { id: 7, date: "05.02.2026", sessionDate: "05.02.2026", code: "EM-31-303", title: "Television Studio Production and Broadcasting Techniques", duration: "02.02.2026 - 06.02.2026", mode: "Online" },
  { id: 8, date: "03.02.2026", sessionDate: "03.02.2026", code: "ME-24-229", title: "Robot Modeling and Simulation", duration: "02.02.2026 - 06.02.2026", mode: "Contact" },
  { id: 9, date: "20.02.2026", sessionDate: "20.02.2026", code: "ED-83-369", title: "INNOVATIVE TEACHING STRATEGIES FOR MODERN LEARNERS", duration: "16.02.2026 - 20.02.2026", mode: "Contact" },
  // JAN 2026
  { id: 10, date: "07.01.2026", sessionDate: "07.01.2026", code: "EM-32-331", title: "Research Paper Writing made Simple: A Technology Supported Framework", duration: "05.01.2026 - 09.01.2026", mode: "Contact" },
  // DEC 2025
  { id: 11, date: "19.12.2025", sessionDate: "19.12.2025", code: "CS-41-298", title: "Data Science and Research Analytics Using R Programming", duration: "15.12.2025 - 19.12.2025", mode: "Contact" },
  { id: 12, date: "19.12.2025", sessionDate: "19.12.2025", code: "ME-33-316", title: "Current Trends and Future Directions In Unmanned Aerial Vehicles", duration: "15.12.2025 - 19.12.2025", mode: "Contact" },
  { id: 13, date: "09.12.2025", sessionDate: "09.12.2025", code: "CS-40-297", title: "Agentic AI for Problem Solving in Real-World Applications", duration: "08.12.2025 - 12.12.2025", mode: "Contact" },
  // NOV 2025
  { id: 14, date: "13.11.2025", sessionDate: "13.11.2025", code: "CS-34-267", title: "Exploring Recent Advances and Applications in Transfer Learning", duration: "10.11.2025 - 14.11.2025", mode: "Contact" },
  // SEP 2025
  { id: 15, date: "23.09.2025", sessionDate: "23.09.2025", code: "CD-29-219", title: "Application of Generative AI for Question Paper Setting Integrating with Bloom's Taxonomy Levels(BTL)", duration: "22.09.2025 - 26.09.2025", mode: "Contact" },
  { id: 16, date: "10.09.2025", sessionDate: "10.09.2025", code: "ED-43-196", title: "Effective Research Proposal Writing", duration: "08.09.2025 - 12.09.2025", mode: "Contact" },
  { id: 17, date: "10.09.2025", sessionDate: "10.09.2025", code: "EM-24-239", title: "Mastering in Research Article Writing and Grant Proposal Drafting", duration: "08.09.2025 - 12.09.2025", mode: "Contact" },
  // AUG 2025
  { id: 18, date: "19.08.2025", sessionDate: "19.08.2025", code: "ME-18-182", title: "Smart UAV Systems: Leveraging loT and Image Processing", duration: "18.08.2025 - 22.08.2025", mode: "Online" },
  { id: 19, date: "06.08.2025", sessionDate: "06.08.2025", code: "CD-19-153", title: "Developing a Curriculum Framework Aligned with NEP 2020, OBE, and AI Advancements", duration: "04.08.2025 - 08.08.2025", mode: "Online" },
  { id: 20, date: "07.08.2025", sessionDate: "07.08.2025", code: "CS-20-150", title: "Advanced Pedagogical Strategies for Impactful STEM Learning in AI, ML, and DS Courses", duration: "04.08.2025 - 08.08.2025", mode: "Online" },
  { id: 21, date: "05.08.2025", sessionDate: "05.08.2025", code: "EC-10-158", title: "Networking and Data Communication", duration: "04.08.2025 - 08.08.2025", mode: "Online" },
  // JUL 2025
  { id: 22, date: "16.07.2025", sessionDate: "16.07.2025", code: "EM-15-112", title: "Tech driven Research Paper Writing A step by step approach with digital tools", duration: "14.07.2025 - 18.07.2025", mode: "Contact" },
  { id: 23, date: "11.07.2025", sessionDate: "11.07.2025", code: "CS-13-101", title: "Empowering Text Intelligence Through Natural Language Processing", duration: "07.07.2025 - 11.07.2025", mode: "Contact" },
  // MAR 2025
  { id: 24, date: "20.03.2025", sessionDate: "20.03.2025", code: "EM-27-320", title: "Strategic Thinking with AI: Unlocking the Potential of Multimedia", duration: "17.03.2025 - 21.03.2025", mode: "Online" },
  { id: 25, date: "12.03.2025", sessionDate: "12.03.2025", code: "RE-34-314", title: "Quality Management", duration: "10.03.2025 - 14.03.2025", mode: "Online" },
  { id: 26, date: "10.03.2025", sessionDate: "10.03.2025", code: "EC-12-312", title: "Wireless Communication", duration: "10.03.2025 - 14.03.2025", mode: "Online" },
  // FEB 2025
  { id: 27, date: "17.02.2025", sessionDate: "17.02.2025", code: "ME-49-286", title: "Advancement in Robotics", duration: "17.02.2025 - 21.02.2025", mode: "Contact" },
  { id: 28, date: "24.02.2025", sessionDate: "24.02.2025", code: "CD-31-288", title: "Technical Research to Publication Practical Insights into Journal Paper Drafting", duration: "24.02.2025 - 28.02.2025", mode: "Contact" },
  { id: 29, date: "11.02.2025", sessionDate: "11.02.2025", code: "RE-31-279", title: "Design Thinking for Entrepreneurship", duration: "10.02.2025 - 14.02.2025", mode: "Contact" },
  // JAN 2025
  { id: 30, date: "28.01.2025", sessionDate: "28.01.2025", code: "RE-29-261", title: "Innovation & Startup in Under Water", duration: "27.01.2025 - 31.01.2025", mode: "Contact" },
  { id: 31, date: "09.01.2025", sessionDate: "09.01.2025", code: "ME-13-61", title: "Robot Modeling and Simulation", duration: "06.01.2025 - 10.01.2025", mode: "Contact" },
  // DEC 2024
  { id: 32, date: "17.12.2024", sessionDate: "17.12.2024", code: "EE-21-230", title: "Sensors and Instrumentation", duration: "16.12.2024 - 20.12.2024", mode: "Online" },
  { id: 33, date: "06.12.2024", sessionDate: "06.12.2024", code: "RE-25-215", title: "Product development for entrepreneurship", duration: "02.12.2024 - 06.12.2024", mode: "Online" },
  { id: 34, date: "18.12.2024", sessionDate: "18.12.2024", code: "Null", title: "Research Article, Thesis Writing and IPR", duration: "16.12.2024 - 20.12.2024", mode: "Contact" },
  { id: 35, date: "05.12.2024", sessionDate: "05.12.2024", code: "RE-21-199", title: "Concept to Creation: Design Thinking and Product Development for Aspiring Innovators", duration: "02.12.2024 - 06.12.2024", mode: "Online" },
  // NOV 2024
  { id: 36, date: "20.11.2024", sessionDate: "20.11.2024", code: "CD-22-190", title: "Course Material Preparation Workshop C.24.1", duration: "19.11.2024 - 23.11.2024", mode: "Contact" },
  { id: 37, date: "19.11.2024", sessionDate: "19.11.2024", code: "ME-35-198", title: "Present and Future Trends in Unmanned Aerial Vehicles", duration: "18.11.2024 - 22.11.2024", mode: "Online" }
];

function normalize(s) {
  return (s || "").toLowerCase().trim();
}

/* ✅ Convert DD.MM.YYYY -> "MMM YYYY" */
function monthYearFromDDMMYYYY(ddmmyyyy) {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(ddmmyyyy || "");
  if (!m) return "—";
  const [, , mm, yy] = m;

  const months = [
    "JAN","FEB","MAR","APR","MAY","JUN",
    "JUL","AUG","SEP","OCT","NOV","DEC",
  ];

  const idx = Number(mm) - 1;
  return `${months[idx] || "—"} ${yy}`;
}

/* ✅ Sort key for "MMM YYYY" */
function monthYearKey(monYear) {
  const m = /^(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+(\d{4})$/.exec(
    (monYear || "").trim().toUpperCase()
  );
  if (!m) return 0;

  const months = {
    JAN: "01", FEB: "02", MAR: "03", APR: "04", MAY: "05", JUN: "06",
    JUL: "07", AUG: "08", SEP: "09", OCT: "10", NOV: "11", DEC: "12",
  };

  const mon = months[m[1]] || "00";
  const yr = m[2];
  return Number(`${yr}${mon}00`);
}

function pillClass(mode) {
  if (mode === "Contact") return "pill contact";
  if (mode === "Online") return "pill online";
  if (mode === "Hybrid") return "pill Hybrid";
  return "pill other";
}

/** ✅ Validate a real calendar date */
function isValidDateInput(dateInput) {
  const s = (dateInput || "").trim().toUpperCase();

  // "31.12.2025" Format check
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(s)) return true;

  // "JAN 2025" Format check
  if (/^(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+(\d{4})$/.test(s)) return true;

  return false;
}

export default function PdpResource() {
  const { user, isAdmin } = useContext(AuthContext);
  const isLoggedIn = !!user;

  const [q, setQ] = useState("");
  // Local state initialized with our raw data
  const [items, setItems] = useState(INITIAL_DATA);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    date: "",        // grouping date (month header)
    code: "",
    title: "",
    duration: "",
    mode: "Contact",
    sessionDate: "", // actual session date shown in table
  });

  const filteredItems = useMemo(() => {
    const query = normalize(q);
    if (!query) return items;

    return items.filter((it) =>
      normalize(
        `${it.date} ${monthYearFromDDMMYYYY(it.date)} ${it.sessionDate} ${it.code} ${it.title} ${it.duration} ${it.mode}`
      ).includes(query)
    );
  }, [items, q]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const it of filteredItems) {
      const key = monthYearFromDDMMYYYY(it.date) || "—";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(it);
    }

    const entries = Array.from(map.entries());
    for (const [, arr] of entries) arr.sort((a, b) => (b.id || 0) - (a.id || 0));
    entries.sort((a, b) => monthYearKey(b[0]) - monthYearKey(a[0]));
    return entries;
  }, [filteredItems]);

  function resetForm() {
    setEditingId(null);
    setForm({
      date: "",
      code: "",
      title: "",
      duration: "",
      mode: "Contact",
      sessionDate: "",
    });
  }

  function onSubmit(e) {
    e.preventDefault();

    const payloadUI = {
      date: form.date.trim(),
      code: form.code.trim(),
      title: form.title.trim(),
      duration: form.duration.trim(),
      mode: form.mode,
      sessionDate: form.sessionDate.trim(),
    };

    if (!payloadUI.date || !payloadUI.code || !payloadUI.title || !payloadUI.sessionDate) {
      alert("Please fill Date, Code, Title, and Session Date.");
      return;
    }

    if (!isValidDateInput(payloadUI.date) || !isValidDateInput(payloadUI.sessionDate)) {
      alert('Dates must be "DD.MM.YYYY" OR "JAN 2025".');
      return;
    }

    const newItem = {
      id: editingId ? editingId : Date.now(),
      date: payloadUI.date,
      sessionDate: payloadUI.sessionDate,
      code: payloadUI.code,
      title: payloadUI.title,
      duration: payloadUI.duration,
      mode: payloadUI.mode,
    };

    if (editingId) {
      setItems((prev) => prev.map((it) => (it.id === editingId ? newItem : it)));
    } else {
      setItems((prev) => [newItem, ...prev]);
    }

    resetForm();
  }

  function onEdit(item) {
    setEditingId(item.id);
    setForm({
      date: item.date || "",
      code: item.code || "",
      title: item.title || "",
      duration: item.duration || "",
      mode: item.mode || "Contact",
      sessionDate: item.sessionDate || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onDelete(id) {
    if (!confirm("Delete this programme?")) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  function reloadData() {
    // Reset to the original static data and clear search
    setItems(INITIAL_DATA);
    setQ("");
  }

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-left">
          <h1>Professional Development Programmes (PDP) - As Resource person</h1>
          <p>5 Days Training Program</p>
        </div>

        <div className="hero-right">
          <input
            className="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search: By year / code / title / mode..."
          />
          <button className="ghost" onClick={reloadData} title="Reset Filter & Data">
            Refresh
          </button>
        </div>
      </header>

      <div className="content">
        {grouped.length === 0 ? (
          <div className="empty">No results found.</div>
        ) : (
          grouped.map(([date, arr]) => (
            <section className="group" key={date}>
              <div className="group-head">
                <div className="group-date">{date}</div>
                <div className="group-count">
                  {arr.length} Programme{arr.length > 1 ? "s" : ""}
                </div>
              </div>

              <div className="table">
                <div className="tr head">
                  <div>S.No</div>
                  <div>Code</div>
                  <div>Title</div>
                  <div>Duration</div>
                  <div>Mode</div>
                  <div>Session Date</div>
                  <div>Active</div>
                </div>

                {arr.map((it, idx) => (
                  <div className="tr" key={it.id}>
                    <div className="muted">{idx + 1}</div>
                    <div className="code">{it.code}</div>
                    <div className="programme">{it.title}</div>
                    <div className="muted">{it.duration}</div>
                    <div>
                      <span className={pillClass(it.mode)}>{it.mode}</span>
                    </div>

                    <div className="muted">{it.sessionDate || it.date}</div>

                    <div className="actions">
                      {isLoggedIn ? (
                        <>
                          <span className="pill other">Active</span>
                          <button className="edit" onClick={() => onEdit(it)}>
                            Edit
                          </button>
                          <button className="del" onClick={() => onDelete(it.id)}>
                            Delete
                          </button>
                        </>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {isAdmin && (
        <div className="panel bottom-form">
          <h2>{editingId ? "Edit Programme" : "Add Programme"}</h2>

          <form onSubmit={onSubmit} className="form">
            <label>
              Date (DD.MM.YYYY or JAN 2025)
              <input
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                placeholder="31.12.2025  (or)  JAN 2025"
              />
            </label>

            <label>
              Code
              <input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="CS-40-297"
              />
            </label>

            <label>
              Title
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Programme title..."
              />
            </label>

            <label>
              Duration (Start - End)
              <input
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="05.01.2026 - 09.01.2026"
              />
            </label>

            <label>
              Mode
              <select
                value={form.mode}
                onChange={(e) => setForm({ ...form, mode: e.target.value })}
              >
                <option>Contact</option>
                <option>Online</option>
                <option>Hybrid</option>
              </select>
            </label>

            <label>
              Session Date (DD.MM.YYYY or JAN 2025)
              <input
                value={form.sessionDate}
                onChange={(e) => setForm({ ...form, sessionDate: e.target.value })}
                placeholder="31.12.2025  (or)  JAN 2025"
              />
            </label>

            <div className="btns">
              <button className="primary" type="submit">
                {editingId ? "Update" : "Add"}
              </button>
              <button className="ghost" type="button" onClick={resetForm}>
                {editingId ? "Cancel" : "Clear"}
              </button>
            </div>

            <div className="note">
              Tip: Date / Code / Title / Session Date required. Duration must be DD.MM.YYYY - DD.MM.YYYY
            </div>
          </form>
        </div>
      )}

      <footer className="footer">
        Running on static local data (No Database Connected).
      </footer>
    </div>
  );
}