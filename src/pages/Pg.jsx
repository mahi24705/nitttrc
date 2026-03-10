// src/pages/Pg.jsx
import { useMemo, useState, useContext } from "react";
import "./Pg.css";
import { AuthContext } from "../context/AuthContext";

const DEFAULT_PROGRAMME = "M.Tech VLSI Embedded System";

const INITIAL_DATA = [
  {
    id: 1,
    programme: "M.Tech VLSI Embedded System",
    subjectName: "Embedded Wireless Sensor Networks",
    subjectCode: "VE24P13",
    periodYears: 2025,
    semester: "2",
    noOfStudents: 24,
  },
  {
    id: 2,
    programme: "M.Tech VLSI Embedded System",
    subjectName: "Embedded Wireless Sensor Networks",
    subjectCode: "VE24P13",
    periodYears: 2025,
    semester: "1",
    noOfStudents: 18,
  },
  {
    id: 3,
    programme: "M.Tech VLSI Embedded System",
    subjectName: "Network Embedded Application",
    subjectCode: "VE24B12",
    periodYears: 2026,
    semester: "2",
    noOfStudents: 18,
  },
];

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

function Row({ label, value }) {
  return (
    <div className="row-item">
      <div className="row-label">{label}</div>
      <div className="row-value">{value || "—"}</div>
    </div>
  );
}

export default function Pg() {
  const { user, isAdmin } = useContext(AuthContext);
  const isLoggedIn = !!user;

  const [q, setQ] = useState("");
  const [items, setItems] = useState(INITIAL_DATA);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    programme: DEFAULT_PROGRAMME,
    subjectName: "",
    subjectCode: "",
    periodYears: "",
    semester: "",
    noOfStudents: "",
  });

  const filteredItems = useMemo(() => {
    const query = normalize(q);

    if (!query) return items;

    return items.filter((it) =>
      normalize(
        `${it.programme} ${it.subjectName} ${it.subjectCode} ${it.periodYears} ${it.semester} ${it.noOfStudents}`
      ).includes(query)
    );
  }, [items, q]);

  function resetForm() {
    setEditingId(null);
    setForm({
      programme: DEFAULT_PROGRAMME,
      subjectName: "",
      subjectCode: "",
      periodYears: "",
      semester: "",
      noOfStudents: "",
    });
  }

  function resetAll() {
    setQ("");
    resetForm();
  }

  function handleChange(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function onSubmit(e) {
    e.preventDefault();

    const payload = {
      programme: String(form.programme || "").trim(),
      subjectName: String(form.subjectName || "").trim(),
      subjectCode: String(form.subjectCode || "").trim(),
      periodYears: Number(String(form.periodYears || "").trim()),
      semester: String(form.semester || "").trim(),
      noOfStudents: Number(String(form.noOfStudents || "").trim()),
    };

    if (
      !payload.programme ||
      !payload.subjectName ||
      !payload.subjectCode ||
      !String(form.periodYears).trim() ||
      !payload.semester ||
      !String(form.noOfStudents).trim()
    ) {
      alert("Please fill all fields.");
      return;
    }

    if (Number.isNaN(payload.periodYears) || Number.isNaN(payload.noOfStudents)) {
      alert("Period and No of Students must be numbers.");
      return;
    }

    const newItem = {
      id: editingId || Date.now(),
      ...payload,
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
      programme: item.programme || DEFAULT_PROGRAMME,
      subjectName: item.subjectName || "",
      subjectCode: item.subjectCode || "",
      periodYears: item.periodYears ?? "",
      semester: item.semester ?? "",
      noOfStudents: item.noOfStudents ?? "",
    });

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  }

  function onDelete(id) {
    const ok = window.confirm("Delete this programme?");
    if (!ok) return;

    setItems((prev) => prev.filter((it) => it.id !== id));

    if (editingId === id) {
      resetForm();
    }
  }

  function reloadData() {
    setItems(INITIAL_DATA);
    setQ("");
    resetForm();
  }

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-left">
          <h1>PG</h1>
          <p>Post Graduate Programmes</p>
        </div>

        <div className="hero-right">
          <input
            type="text"
            className="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search: programme / subject / period / semester"
          />

          <button
            type="button"
            className="ghost"
            onClick={reloadData}
            title="Reset data and search"
          >
            Refresh
          </button>

          {(isAdmin || isLoggedIn) && (
            <button
              type="button"
              className="ghost"
              onClick={resetAll}
              title="Clear search and form"
            >
              Clear
            </button>
          )}
        </div>
      </header>

      <div className="content">
        {filteredItems.length === 0 ? (
          <div className="empty">No data yet.</div>
        ) : (
          <div className="card-container">
            {filteredItems.map((it, idx) => (
              <section className="group" key={it.id}>
                <div className="group-head">
                  <div className="group-date">Programme #{idx + 1}</div>
                </div>

                <div className="card-body">
                  <Row label="Programme name" value={it.programme || DEFAULT_PROGRAMME} />
                  <Row label="Subject name" value={it.subjectName} />
                  <Row label="Subject code" value={it.subjectCode} />
                  <Row label="Period (Years)" value={it.periodYears} />
                  <Row label="Semester" value={it.semester} />
                  <Row label="No of Students" value={it.noOfStudents} />

                  {(isAdmin || isLoggedIn) && (
                    <div className="actions">
                      <button
                        type="button"
                        className="edit"
                        onClick={() => onEdit(it)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="del"
                        onClick={() => onDelete(it.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="panel bottom-form">
          <h2>{editingId ? "Edit Programme" : "Add Programme"}</h2>

          <form onSubmit={onSubmit} className="form">
            <label>
              Programme Name
              <input
                type="text"
                value={form.programme}
                onChange={(e) => handleChange("programme", e.target.value)}
                placeholder={DEFAULT_PROGRAMME}
              />
            </label>

            <label>
              Subject Name
              <input
                type="text"
                value={form.subjectName}
                onChange={(e) => handleChange("subjectName", e.target.value)}
                placeholder="Subject name..."
              />
            </label>

            <label>
              Subject Code
              <input
                type="text"
                value={form.subjectCode}
                onChange={(e) => handleChange("subjectCode", e.target.value)}
                placeholder="Subject code..."
              />
            </label>

            <label>
              Period (Years)
              <input
                type="text"
                value={form.periodYears}
                onChange={(e) => handleChange("periodYears", e.target.value)}
                placeholder="2025"
              />
            </label>

            <label>
              Semester
              <input
                type="text"
                value={form.semester}
                onChange={(e) => handleChange("semester", e.target.value)}
                placeholder="1 / 2 / 3..."
              />
            </label>

            <label>
              No of Students
              <input
                type="text"
                value={form.noOfStudents}
                onChange={(e) => handleChange("noOfStudents", e.target.value)}
                placeholder="60"
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
          </form>
        </div>
      )}

      <footer className="footer">
        Running on static local data (No Database Connected).
      </footer>
    </div>
  );
}