// src/pages/Pg.jsx
import { useEffect, useMemo, useState, useContext } from "react";
import "./AsCoordinator.css";
import { AuthContext } from "../context/AuthContext";

/** ✅ DB MODE ONLY */
const API_BASE = "http://10.22.39.232:8080/api/pg-programmes";

function normalize(s) {
  return (s || "").toLowerCase().trim();
}

function Row({ label, value }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "170px 1fr",
        gap: "10px",
        padding: "10px 0",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div className="muted" style={{ fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ wordBreak: "break-word" }}>{value || "—"}</div>
    </div>
  );
}

export default function Pg() {
  const { user, isAdmin } = useContext(AuthContext);
  const isLoggedIn = !!user;

  const [q, setQ] = useState("");
  const [items, setItems] = useState([]); // ✅ DB is source
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    mtech: "",
    courseName: "",
    courseCode: "",
    subjectName: "",
    subjectCode: "",
    period: "",
    semester: "",
    students: "",
  });

  /** ✅ Load from DB on page load */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setErrMsg("");

        const res = await fetch(API_BASE);
        if (!res.ok) throw new Error(`GET failed: ${res.status}`);

        const data = await res.json();

        const mapped = (data || []).map((row) => ({
          id: row.id,
          mtech: row.mtech || "",
          courseName: row.courseName || "",
          courseCode: row.courseCode || "",
          subjectName: row.subjectName || "",
          subjectCode: row.subjectCode || "",
          period: row.period ?? "",
          semester: row.semester ?? "",
          students: row.students ?? "",
        }));

        mapped.sort((a, b) => (b.id || 0) - (a.id || 0)); // newest first
        setItems(mapped);
      } catch (e) {
        console.error(e);
        setErrMsg("Could not load PG data from backend. Check Spring Boot + CORS.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /** ✅ Search filter */
  const filteredItems = useMemo(() => {
    const query = normalize(q);
    if (!query) return items;

    return items.filter((it) =>
      normalize(
        `${it.mtech} ${it.courseName} ${it.courseCode} ${it.subjectName} ${it.subjectCode} ${it.period} ${it.semester} ${it.students}`
      ).includes(query)
    );
  }, [items, q]);

  function resetForm() {
    setEditingId(null);
    setForm({
      mtech: "",
      courseName: "",
      courseCode: "",
      subjectName: "",
      subjectCode: "",
      period: "",
      semester: "",
      students: "",
    });
  }

  function resetAll() {
    setQ("");
    resetForm();
  }

  /** ✅ ADD or UPDATE to DB */
  async function onSubmit(e) {
    e.preventDefault();

    const payload = {
      mtech: form.mtech.trim(),
      courseName: form.courseName.trim(),
      courseCode: form.courseCode.trim(),
      subjectName: form.subjectName.trim(),
      subjectCode: form.subjectCode.trim(),
      period: String(form.period).trim(),
      semester: String(form.semester).trim(),
      students: String(form.students).trim(),
    };

    // ✅ required fields
    if (
      !payload.mtech ||
      !payload.courseName ||
      !payload.courseCode ||
      !payload.subjectName ||
      !payload.subjectCode ||
      !payload.period ||
      !payload.semester ||
      !payload.students
    ) {
      alert("Please fill all fields.");
      return;
    }

    // ✅ validate students numeric
    if (Number.isNaN(Number(payload.students))) {
      alert("No. of Students must be a number.");
      return;
    }

    try {
      setErrMsg("");

      let res;
      if (editingId) {
        res = await fetch(`${API_BASE}/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(API_BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }

      const saved = await res.json(); // should return saved row with id
      const uiItem = { id: saved.id, ...payload };

      if (editingId) {
        setItems((prev) => prev.map((it) => (it.id === editingId ? uiItem : it)));
      } else {
        setItems((prev) => [uiItem, ...prev]);
      }

      resetForm();
    } catch (err) {
      console.error(err);
      alert("Save failed: " + (err?.message || "Unknown error"));
    }
  }

  function onEdit(item) {
    setEditingId(item.id);
    setForm({
      mtech: item.mtech || "",
      courseName: item.courseName || "",
      courseCode: item.courseCode || "",
      subjectName: item.subjectName || "",
      subjectCode: item.subjectCode || "",
      period: item.period ?? "",
      semester: item.semester ?? "",
      students: item.students ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /** ✅ DELETE from DB */
  async function onDelete(id) {
    if (!confirm("Delete this programme?")) return;

    try {
      setErrMsg("");

      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }

      setItems((prev) => prev.filter((it) => it.id !== id));
    } catch (e) {
      console.error(e);
      alert("Delete failed: " + (e?.message || "Unknown error"));
    }
  }

  /** ✅ REFRESH button (fetch again) */
  async function refreshFromDb() {
    try {
      setLoading(true);
      setErrMsg("");

      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error(`GET failed: ${res.status}`);

      const data = await res.json();
      const mapped = (data || []).map((row) => ({
        id: row.id,
        mtech: row.mtech || "",
        courseName: row.courseName || "",
        courseCode: row.courseCode || "",
        subjectName: row.subjectName || "",
        subjectCode: row.subjectCode || "",
        period: row.period ?? "",
        semester: row.semester ?? "",
        students: row.students ?? "",
      }));

      mapped.sort((a, b) => (b.id || 0) - (a.id || 0));
      setItems(mapped);
    } catch (e) {
      console.error(e);
      setErrMsg("Refresh failed. Check backend logs / CORS.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-left">
          <h1>PG</h1>
          <p>Post Graduate Programmes (DB Mode)</p>
        </div>

        <div className="hero-right">
          <input
            className="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search: mtech / course / code / subject / period / semester / students..."
          />

          <button className="ghost" onClick={refreshFromDb} title="Reload from DB">
            Refresh
          </button>

          {(isAdmin || isLoggedIn) && (
            <button className="ghost" onClick={resetAll} title="Clear search/form">
              Clear
            </button>
          )}
        </div>
      </header>

      {errMsg && (
        <div className="empty" style={{ marginBottom: 12 }}>
          {errMsg}
        </div>
      )}

      {/* ✅ VERTICAL LIST OUTPUT */}
      <div className="content">
        {loading ? (
          <div className="empty">Loading...</div>
        ) : filteredItems.length === 0 ? (
          <div className="empty">No data yet.</div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {filteredItems.map((it, idx) => (
              <section className="group" key={it.id}>
                <div className="group-head">
                  <div className="group-date">Programme #{idx + 1}</div>
                  {/* ✅ If you DON'T want to show id, delete this line */}
                  <div className="group-count">ID: {it.id}</div>
                </div>

                <div
                  style={{
                    background: "white",
                    borderRadius: 14,
                    padding: 16,
                    border: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <Row label="M.Tech" value={it.mtech} />
                  <Row label="Course name" value={it.courseName} />
                  <Row label="Course code" value={it.courseCode} />
                  <Row label="Subject name" value={it.subjectName} />
                  <Row label="Subject code" value={it.subjectCode} />
                  <Row label="Period (Years)" value={it.period} />
                  <Row label="Semester" value={it.semester} />
                  <Row label="No. of Students" value={it.students} />

                  {isAdmin && (
                    <div className="actions" style={{ marginTop: 12 }}>
                      <button className="edit" onClick={() => onEdit(it)}>
                        Edit
                      </button>
                      <button className="del" onClick={() => onDelete(it.id)}>
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

      {/* ✅ Add/Edit Form (Admin only) */}
      {isAdmin && (
        <div className="panel bottom-form">
          <h2>{editingId ? "Edit Programme" : "Add Programme"}</h2>

          <form onSubmit={onSubmit} className="form">
            <label>
              M.Tech
              <input
                value={form.mtech}
                onChange={(e) => setForm({ ...form, mtech: e.target.value })}
                placeholder="M.Tech / VLSI / Embedded..."
              />
            </label>

            <label>
              Course name
              <input
                value={form.courseName}
                onChange={(e) => setForm({ ...form, courseName: e.target.value })}
                placeholder="Course name..."
              />
            </label>

            <label>
              Course code
              <input
                value={form.courseCode}
                onChange={(e) => setForm({ ...form, courseCode: e.target.value })}
                placeholder="Course code..."
              />
            </label>

            <label>
              Subject name
              <input
                value={form.subjectName}
                onChange={(e) => setForm({ ...form, subjectName: e.target.value })}
                placeholder="Subject name..."
              />
            </label>

            <label>
              Subject code
              <input
                value={form.subjectCode}
                onChange={(e) => setForm({ ...form, subjectCode: e.target.value })}
                placeholder="Subject code..."
              />
            </label>

            <label>
              Period (Years)
              <input
                value={form.period}
                onChange={(e) => setForm({ ...form, period: e.target.value })}
                placeholder="2"
              />
            </label>

            <label>
              Semester
              <input
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: e.target.value })}
                placeholder="1 / 2 / 3..."
              />
            </label>

            <label>
              No of Students
              <input
                value={form.students}
                onChange={(e) => setForm({ ...form, students: e.target.value })}
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

            <div className="note">Tip: All fields are required.</div>
          </form>
        </div>
      )}

      <footer className="footer">
        Now using database (MySQL) via Spring Boot API.
      </footer>
    </div>
  );
}