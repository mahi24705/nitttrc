// src/pages/Itp.jsx
import { useEffect, useMemo, useState, useContext } from "react";
import "./PdpResource.css";
import { AuthContext } from "../context/AuthContext";

const API = "http://10.22.39.232:8080/api/itpprogrammes";

function normalize(s) {
  return (s || "").toLowerCase().trim();
}

/* Convert "31.12.2025" -> "JAN 2025" (for grouping header) */
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

/** ✅ Accept both "31.12.2025" and "JAN 2025" but STORE as DD.MM.YYYY string */
function normalizeDateInputToDDMMYYYY(input) {
  const s = (input || "").trim().toUpperCase();

  // DD.MM.YYYY
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(s)) return s;

  // MON YYYY -> make "01.MM.YYYY"
  const monYear =
    /^(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+(\d{4})$/.exec(s);

  if (monYear) {
    const monMap = {
      JAN: "01", FEB: "02", MAR: "03", APR: "04", MAY: "05", JUN: "06",
      JUL: "07", AUG: "08", SEP: "09", OCT: "10", NOV: "11", DEC: "12",
    };
    const mm = monMap[monYear[1]];
    const yyyy = monYear[2];
    return `01.${mm}.${yyyy}`;
  }

  return "";
}

/** Duration: ensure format "DD.MM.YYYY - DD.MM.YYYY" */
function normalizeDuration(duration) {
  const s = (duration || "")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

  if (!s) return "";

  const parts = s.includes(" to ")
    ? s.split(" to ").map((x) => x.trim())
    : s.split("-").map((x) => x.trim());

  const start = parts[0] || "";
  const end = parts[1] || "";
  if (!/^\d{2}\.\d{2}\.\d{4}$/.test(start)) return "";
  if (!/^\d{2}\.\d{2}\.\d{4}$/.test(end)) return "";

  return `${start} - ${end}`;
}

export default function Itp() {
  const { user, isAdmin } = useContext(AuthContext);
  const isLoggedIn = !!user;

  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    date: "",        // grouping date (we will keep as DD.MM.YYYY for header grouping)
    code: "",
    title: "",
    duration: "",
    mode: "Contact",
    sessionDate: "", // actual session date
  });

  async function loadFromDb() {
    try {
      setLoading(true);
      setErrMsg("");

      const res = await fetch(API);
      if (!res.ok) throw new Error(`GET failed: ${res.status}`);
      const data = await res.json();

      // ✅ Map backend -> UI
      const ui = (data || []).map((x) => ({
        id: x.id,
        date: x.programmeDate || "—",     // used for grouping header
        sessionDate: x.sessionDate || "—",
        code: x.code || "—",
        title: x.title || "—",
        duration: x.duration || "—",
        mode: x.mode || "—",
      }));

      setItems(ui);
    } catch (e) {
      console.error(e);
      setErrMsg("Could not load data from backend. Check Spring Boot + CORS.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFromDb();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  async function onSubmit(e) {
    e.preventDefault();

    // ✅ Normalize dates
    const programmeDate = normalizeDateInputToDDMMYYYY(form.date);
    const sessionDate = normalizeDateInputToDDMMYYYY(form.sessionDate);
    const duration = normalizeDuration(form.duration);

    if (!programmeDate || !form.code.trim() || !form.title.trim() || !sessionDate) {
      alert("Please fill Date, Code, Title, and Session Date (DD.MM.YYYY or JAN YYYY).");
      return;
    }

    if (!duration) {
      alert("Duration must be: DD.MM.YYYY - DD.MM.YYYY");
      return;
    }

    // ✅ This body matches your backend fields EXACTLY
    const body = {
      programmeDate,                 // string like "31.12.2025"
      code: form.code.trim(),        // "ITP-01-001"
      title: form.title.trim(),      // "Demo title"
      duration,                      // "05.01.2026 - 09.01.2026"
      mode: form.mode,               // "Contact"
      sessionDate,                   // string like "31.12.2025"
    };

    try {
      setErrMsg("");

      if (editingId) {
        const res = await fetch(`${API}/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(await res.text());

        const saved = await res.json();

        const updated = {
          id: saved.id,
          date: saved.programmeDate || programmeDate,
          sessionDate: saved.sessionDate || sessionDate,
          code: saved.code,
          title: saved.title,
          duration: saved.duration,
          mode: saved.mode,
        };

        setItems((prev) => prev.map((it) => (it.id === editingId ? updated : it)));
      } else {
        const res = await fetch(API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(await res.text());

        const saved = await res.json();

        const created = {
          id: saved.id,
          date: saved.programmeDate || programmeDate,
          sessionDate: saved.sessionDate || sessionDate,
          code: saved.code,
          title: saved.title,
          duration: saved.duration,
          mode: saved.mode,
        };

        setItems((prev) => [created, ...prev]);
      }

      resetForm();
    } catch (e) {
      console.error(e);
      setErrMsg(`Save failed: ${e.message}`);
    }
  }

  function onEdit(item) {
    setEditingId(item.id);
    setForm({
      date: item.date === "—" ? "" : item.date,
      code: item.code === "—" ? "" : item.code,
      title: item.title === "—" ? "" : item.title,
      duration: item.duration === "—" ? "" : item.duration,
      mode: item.mode && item.mode !== "—" ? item.mode : "Contact",
      sessionDate: item.sessionDate === "—" ? "" : item.sessionDate,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onDelete(id) {
    if (!confirm("Delete this programme?")) return;
    try {
      setErrMsg("");
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      setItems((prev) => prev.filter((it) => it.id !== id));
    } catch (e) {
      console.error(e);
      setErrMsg(`Delete failed: ${e.message}`);
    }
  }

  async function refreshFromDb() {
    await loadFromDb();
  }

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-left">
          <h1>ITP</h1>
          <p>Industrial Training Programmes</p>
        </div>

        <div className="hero-right">
          <input
            className="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search: By year / code / title / mode..."
          />
          <button className="ghost" onClick={refreshFromDb} title="Reload from DB">
            Refresh
          </button>
        </div>
      </header>

      {errMsg && (
        <div className="empty" style={{ marginBottom: 12 }}>
          {errMsg}
        </div>
      )}

      <div className="content">
        {loading ? (
          <div className="empty">Loading...</div>
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
                  <div>Session Date</div>
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
                    <div className="muted">{it.sessionDate || it.date}</div>

                    <div className="actions">
                      {isLoggedIn ? (
                        <>
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
                placeholder="ITP-01-001"
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
        Now connected to DB (Spring Boot → MySQL). Workbench is only for verifying data.
      </footer>
    </div>
  );
}