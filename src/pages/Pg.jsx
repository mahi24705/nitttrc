import { useEffect, useMemo, useState, useContext } from "react";
import "./AsCoordinator.css"; // ✅ reuse same CSS UI
import { AuthContext } from "../context/AuthContext";

// ✅ PG API Endpoint (change if needed)
const API_BASE = "http://10.22.39.232:8080/api/pg-programmes";

function normalize(s) {
  return (s || "").toLowerCase().trim();
}

export default function Pg() {
  const { isAdmin } = useContext(AuthContext);

  const [q, setQ] = useState("");
  const [items, setItems] = useState([]); // ✅ DB is source
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    mtech: "",
    courseName: "",
    courseCode: "",
    period: "",
    semester: "",
    students: "",
  });

  /* ✅ Load from DB on page load */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(API_BASE);
        if (!res.ok) throw new Error("Failed to load PG programmes");
        const data = await res.json();

        // Expect backend rows like:
        // { id, mtech, courseName, courseCode, period, semester, students }
        const mapped = (data || []).map((row) => ({
          id: row.id,
          mtech: row.mtech || "",
          courseName: row.courseName || "",
          courseCode: row.courseCode || "",
          period: row.period ?? "",
          semester: row.semester ?? "",
          students: row.students ?? "",
        }));

        // newest first
        mapped.sort((a, b) => (b.id || 0) - (a.id || 0));
        setItems(mapped);
      } catch (e) {
        console.error(e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredItems = useMemo(() => {
    const query = normalize(q);
    if (!query) return items;

    return items.filter((it) =>
      normalize(
        `${it.mtech} ${it.courseName} ${it.courseCode} ${it.period} ${it.semester} ${it.students}`
      ).includes(query)
    );
  }, [items, q]);

  function resetForm() {
    setEditingId(null);
    setForm({
      mtech: "",
      courseName: "",
      courseCode: "",
      period: "",
      semester: "",
      students: "",
    });
  }

  function resetAll() {
    setQ("");
    resetForm();
  }

  /* ✅ ADD or UPDATE to DB */
  async function onSubmit(e) {
    e.preventDefault();

    const payload = {
      mtech: form.mtech.trim(),
      courseName: form.courseName.trim(),
      courseCode: form.courseCode.trim(),
      period: String(form.period).trim(),
      semester: String(form.semester).trim(),
      students: String(form.students).trim(),
    };

    if (
      !payload.mtech ||
      !payload.courseName ||
      !payload.courseCode ||
      !payload.period ||
      !payload.semester ||
      !payload.students
    ) {
      alert("Please fill all fields.");
      return;
    }

    // optional: validate students is number
    if (Number.isNaN(Number(payload.students))) {
      alert("No. of Students must be a number.");
      return;
    }

    try {
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

      if (!res.ok) throw new Error("Save failed");
      const saved = await res.json(); // should return saved row with id

      const uiItem = {
        id: saved.id,
        ...payload,
      };

      if (editingId) {
        setItems((prev) => prev.map((it) => (it.id === editingId ? uiItem : it)));
      } else {
        setItems((prev) => [uiItem, ...prev]);
      }

      resetForm();
    } catch (err) {
      console.error(err);
      alert("Save failed. Check backend running + endpoint.");
    }
  }

  function onEdit(item) {
    setEditingId(item.id);
    setForm({
      mtech: item.mtech || "",
      courseName: item.courseName || "",
      courseCode: item.courseCode || "",
      period: item.period ?? "",
      semester: item.semester ?? "",
      students: item.students ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ✅ DELETE from DB */
  async function onDelete(id) {
    if (!confirm("Delete this programme?")) return;

    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setItems((prev) => prev.filter((it) => it.id !== id));
    } catch (e) {
      console.error(e);
      alert("Delete failed. Check backend.");
    }
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
            className="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search: mtech / course / code / period / semester / students..."
          />
          {isAdmin && (
            <button className="ghost" onClick={resetAll} title="Clear search/form">
              Clear
            </button>
          )}
        </div>
      </header>

      <div className="content">
        {loading ? (
          <div className="empty">Loading from database...</div>
        ) : filteredItems.length === 0 ? (
          <div className="empty">No data yet.</div>
        ) : (
          <section className="group">
            <div className="table">
              <div className="tr head">
                <div>S.No</div>
                <div>M.Tech</div>
                <div>Course name</div>
                <div>Course code</div>
                <div>Period (Years)</div>
                <div>Semester</div>
                <div>No. of Students</div>
                {isAdmin && <div>Action</div>}
              </div>

              {filteredItems.map((it, idx) => (
                <div className="tr" key={it.id}>
                  <div className="muted">{idx + 1}</div>
                  <div className="code">{it.mtech}</div>
                  <div className="programme">{it.courseName}</div>
                  <div className="code">{it.courseCode}</div>
                  <div className="muted">{it.period}</div>
                  <div className="muted">{it.semester}</div>
                  <div className="muted">{it.students}</div>

                  {isAdmin && (
                    <div className="actions">
                      <button className="edit" onClick={() => onEdit(it)}>
                        Edit
                      </button>
                      <button className="del" onClick={() => onDelete(it.id)}>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {true && (
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

      <footer className="footer">Now using database (MySQL) via Spring Boot API.</footer>
    </div>
  );
}