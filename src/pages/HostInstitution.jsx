// src/pages/HostInstitution.jsx
import { useEffect, useMemo, useState, useContext } from "react";
import "./AsCoordinator.css";
import { AuthContext } from "../context/AuthContext";

const API_BASE = "http://localhost:8080/api/host-institutions";

function normalize(s) {
  return (s || "").toLowerCase().trim();
}

function pillClass(mode) {
  if (mode === "Contact") return "pill contact";
  if (mode === "Online") return "pill online";
  if (mode === "Hybrid") return "pill hybrid";
  return "pill other";
}

export default function HostInstitution() {
  const { isAdmin } = useContext(AuthContext);

  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    date: "",
    code: "",
    title: "",
    duration: "",
    mode: "Contact",
    hostInstitutionName: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const res = await fetch(API_BASE);
        if (!res.ok) {
          throw new Error("Failed to load host institution programmes");
        }

        const data = await res.json();

        const mapped = (data || []).map((row) => ({
          id: row.id,
          date: row.date || "",
          code: row.code || "",
          title: row.title || "",
          duration: row.duration || "",
          mode: row.mode || "Contact",
          hostInstitutionName: row.institutionName || "",
        }));

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
        `${it.date} ${it.code} ${it.title} ${it.duration} ${it.mode} ${it.hostInstitutionName}`
      ).includes(query)
    );
  }, [items, q]);

  const grouped = [["Host Institution", filteredItems]];

  function resetForm() {
    setEditingId(null);
    setForm({
      date: "",
      code: "",
      title: "",
      duration: "",
      mode: "Contact",
      hostInstitutionName: "",
    });
  }

  async function onSubmit(e) {
    e.preventDefault();

    const payload = {
      date: form.date.trim(),
      code: form.code.trim(),
      title: form.title.trim(),
      duration: form.duration.trim(),
      mode: form.mode.trim(),
      institutionName: form.hostInstitutionName.trim(),
    };

    if (!payload.date || !payload.code || !payload.title || !payload.duration || !payload.institutionName) {
      alert("Please fill Date, Code, Title, Duration and Host Institution Name.");
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

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Save failed");
      }

      const saved = await res.json();

      const uiItem = {
        id: saved.id,
        date: saved.date || payload.date,
        code: saved.code || payload.code,
        title: saved.title || payload.title,
        duration: saved.duration || payload.duration,
        mode: saved.mode || payload.mode,
        hostInstitutionName: saved.institutionName || payload.institutionName,
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
      date: item.date || "",
      code: item.code || "",
      title: item.title || "",
      duration: item.duration || "",
      mode: item.mode || "Contact",
      hostInstitutionName: item.hostInstitutionName || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onDelete(id) {
    if (!window.confirm("Delete this programme?")) return;

    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");

      setItems((prev) => prev.filter((it) => it.id !== id));
    } catch (e) {
      console.error(e);
      alert("Delete failed. Check backend.");
    }
  }

  function resetAll() {
    setQ("");
    resetForm();
  }

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-left">
          <h1>Host Institution</h1>
          <p>Host Institution Work</p>
        </div>

        <div className="hero-right">
          <input
            className="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search host institution..."
          />
          {isAdmin && (
            <button className="ghost" onClick={resetAll} title="Clear search/form">
              Reset
            </button>
          )}
        </div>
      </header>

      <div className="content">
        {loading ? (
          <div className="empty">Loading from database...</div>
        ) : grouped.length === 0 ? (
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
                  <div>Host Institution</div>
                  <div>Action</div>
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
                    <div className="muted">{it.hostInstitutionName}</div>

                    <div className="actions">
                      {isAdmin && (
                        <>
                          <button className="edit" onClick={() => onEdit(it)}>
                            Edit
                          </button>
                          <button className="del" onClick={() => onDelete(it.id)}>
                            Delete
                          </button>
                        </>
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
              Date
              <input
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                placeholder="31.12.2025"
              />
            </label>

            <label>
              Code
              <input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="EC-20-281"
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
              Duration
              <input
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="08.12.2025 - 12.12.2025"
              />
            </label>

            <label>
              Mode
              <select
                value={form.mode}
                onChange={(e) => setForm({ ...form, mode: e.target.value })}
              >
                <option value="Contact">Contact</option>
                <option value="Online">Online</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </label>

            <label>
              Host Institution Name
              <input
                value={form.hostInstitutionName}
                onChange={(e) =>
                  setForm({ ...form, hostInstitutionName: e.target.value })
                }
                placeholder="Enter host institution name..."
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
              Tip: Date, Code, Title, Duration and Host Institution Name are required.
            </div>
          </form>
        </div>
      )}

      <footer className="footer">
        Now using database (MySQL) via Spring Boot API.
      </footer>
    </div>
  );
}