// src/pages/BoardOfStudies.jsx
import { useEffect, useMemo, useState, useContext } from "react";
import "./AsCoordinator.css";
import { AuthContext } from "../context/AuthContext";

const STORAGE_KEY = "board_of_studies_items_v1";

const RAW_ITEMS = [
  {
    id: 1,
    date: "03.07.2025",
    category: "Board of Studies",
    role: "Expert Member",
    details:
      "Served as expert member for AU – CAC – Affiliated Institutions (Non – Autonomous) – B.Tech. Electronics Engineering (VLSI Design & Technology), M.E. VLSI Design & M.E. Applied Electronics programmes.",
  },
];

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
      <div style={{ wordBreak: "break-word", lineHeight: 1.6 }}>
        {value || "—"}
      </div>
    </div>
  );
}

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveLocal(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export default function BoardOfStudies() {
  const { user, isAdmin } = useContext(AuthContext);
  const isLoggedIn = !!user;

  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    date: "",
    category: "Board of Studies",
    role: "",
    details: "",
  });

  useEffect(() => {
    const stored = loadLocal();

    if (stored.length === 0) {
      setItems(RAW_ITEMS);
      saveLocal(RAW_ITEMS);
    } else {
      setItems(stored);
    }

    setLoading(false);
  }, []);

  const filteredItems = useMemo(() => {
    const query = normalize(q);
    if (!query) return items;

    return items.filter((it) =>
      normalize(`${it.date} ${it.category} ${it.role} ${it.details}`).includes(query)
    );
  }, [items, q]);

  function resetForm() {
    setEditingId(null);
    setForm({
      date: "",
      category: "Board of Studies",
      role: "",
      details: "",
    });
  }

  function resetAll() {
    setQ("");
    resetForm();
  }

  function onSubmit(e) {
    e.preventDefault();

    const payload = {
      date: form.date.trim(),
      category: form.category.trim(),
      role: form.role.trim(),
      details: form.details.trim(),
    };

    if (!payload.date || !payload.category || !payload.role || !payload.details) {
      alert("Please fill all fields.");
      return;
    }

    if (editingId) {
      const updated = items.map((it) =>
        it.id === editingId ? { id: editingId, ...payload } : it
      );
      setItems(updated);
      saveLocal(updated);
    } else {
      const newItem = {
        id: Date.now(),
        ...payload,
      };
      const updated = [newItem, ...items];
      setItems(updated);
      saveLocal(updated);
    }

    resetForm();
  }

  function onEdit(item) {
    setEditingId(item.id);
    setForm({
      date: item.date || "",
      category: item.category || "Board of Studies",
      role: item.role || "",
      details: item.details || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onDelete(id) {
    if (!confirm("Delete this entry?")) return;

    const updated = items.filter((it) => it.id !== id);
    setItems(updated);
    saveLocal(updated);
  }

  function refreshFromLocal() {
    setLoading(true);
    const stored = loadLocal();
    setItems(stored.length ? stored : RAW_ITEMS);
    setLoading(false);
  }

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-left">
          <h1>Board of Studies</h1>
          <p>Academic / Expert Participation</p>
        </div>

        <div className="hero-right">
          <input
            className="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search: date / category / role / details..."
          />

          <button className="ghost" onClick={refreshFromLocal} title="Reload from local storage">
            Refresh
          </button>

          {(isAdmin || isLoggedIn) && (
            <button className="ghost" onClick={resetAll} title="Clear search/form">
              Clear
            </button>
          )}
        </div>
      </header>

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
                  <div className="group-date">Entry #{idx + 1}</div>
                </div>

                <div
                  style={{
                    background: "white",
                    borderRadius: 14,
                    padding: 16,
                    border: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <Row label="Date" value={it.date} />
                  <Row label="Category" value={it.category} />
                  <Row label="Role" value={it.role} />
                  <Row label="Details" value={it.details} />

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

      {isAdmin && (
        <div className="panel bottom-form">
          <h2>{editingId ? "Edit Entry" : "Add Entry"}</h2>

          <form onSubmit={onSubmit} className="form">
            <label>
              Date
              <input
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                placeholder="03.07.2025"
              />
            </label>

            <label>
              Category
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Board of Studies"
              />
            </label>

            <label>
              Role
              <input
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="Expert Member"
              />
            </label>

            <label>
              Details
              <textarea
                value={form.details}
                onChange={(e) => setForm({ ...form, details: e.target.value })}
                placeholder="Enter board of studies details..."
                rows="6"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid rgba(0,0,0,0.12)",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
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

      <footer className="footer">Board of Studies records</footer>
    </div>
  );
}