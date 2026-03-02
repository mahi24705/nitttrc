import { useEffect, useMemo, useState, useContext } from "react";
import "./AsCoordinator.css";
import { AuthContext } from "../context/AuthContext";

const STORAGE_KEY = "as_coordinator_items_v3";

function normalize(s) {
  return (s || "").toLowerCase().trim();
}

/* ✅ Convert DD.MM.YYYY -> "MMM YYYY" (ex: 30.12.2024 -> "DEC 2024") */
function monthYearFromDDMMYYYY(ddmmyyyy) {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(ddmmyyyy || "");
  if (!m) return "—";
  const [, , mm, yy] = m;

  const months = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
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
  if (mode === "Physical") return "pill physical";
  return "pill other";
}

function ensureCreatedAt(list) {
  const now = Date.now();
  return (list || []).map((it, i) => ({
    ...it,
    createdAt: typeof it.createdAt === "number" ? it.createdAt : now - i * 1000,
  }));
}

export default function AsCoordinator() {
  const { isAdmin } = useContext(AuthContext);

  const [q, setQ] = useState("");

  // ✅ START EMPTY (NO RAW DATA)
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return ensureCreatedAt(JSON.parse(saved));
    } catch {}
    return ensureCreatedAt([]); // ✅ empty list initially
  });

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    date: "", // DD.MM.YYYY input
    code: "",
    title: "",
    duration: "",
    mode: "Contact",
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const filteredItems = useMemo(() => {
    const query = normalize(q);
    if (!query) return items;

    // ✅ Search by: "DEC 2024", "2024", "DEC", also "30.12.2024"
    return items.filter((it) =>
      normalize(
        `${it.date} ${it.rawDate || ""} ${it.code} ${it.title} ${it.duration} ${it.mode}`
      ).includes(query)
    );
  }, [items, q]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const it of filteredItems) {
      const key = it.date || "—"; // ✅ month-year
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(it);
    }

    const entries = Array.from(map.entries());

    for (const [, arr] of entries) {
      arr.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }

    // ✅ sort by month-year
    entries.sort((a, b) => monthYearKey(b[0]) - monthYearKey(a[0]));
    return entries;
  }, [filteredItems]);

  function resetForm() {
    setEditingId(null);
    setForm({ date: "", code: "", title: "", duration: "", mode: "Contact" });
  }

  function onSubmit(e) {
    e.preventDefault();

    const payload = {
      date: form.date.trim(), // DD.MM.YYYY from input
      code: form.code.trim(),
      title: form.title.trim(),
      duration: form.duration.trim(),
      mode: form.mode,
    };

    if (!payload.date || !payload.code || !payload.title) {
      alert("Please fill Date, Code, and Programme.");
      return;
    }

    const rawDate = payload.date;
    const monthYear = monthYearFromDDMMYYYY(rawDate);

    if (editingId) {
      setItems((prev) =>
        prev.map((it) =>
          it.id === editingId
            ? {
                ...it,
                ...payload,
                date: monthYear, // ✅ stored as month-year
                rawDate, // ✅ store original date
                createdAt: it.createdAt || Date.now(),
              }
            : it
        )
      );
    } else {
      setItems((prev) => [
        {
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          ...payload,
          date: monthYear,
          rawDate,
        },
        ...prev,
      ]);
    }

    resetForm();
  }

  function onEdit(item) {
    setEditingId(item.id);
    setForm({
      // ✅ show DD.MM.YYYY in input while editing
      date: item.rawDate || "",
      code: item.code || "",
      title: item.title || "",
      duration: item.duration || "",
      mode: item.mode || "Contact",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onDelete(id) {
    if (!confirm("Delete this programme?")) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  // ✅ reset = clear all items (since no raw data now)
  function resetAll() {
    if (!confirm("Clear all programmes?")) return;
    setItems([]);
    setQ("");
    resetForm();
  }

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-left">
          <h1>Professional Development Programmes (PDP)/As Coordinator</h1>
          <p>5 Days Training Program</p>
        </div>

        <div className="hero-right">
          <input
            className="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search: month / year / code / programme / mode..."
          />
          {isAdmin && (
            <button className="ghost" onClick={resetAll} title="Clear all">
              Reset
            </button>
          )}
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
              Date (DD.MM.YYYY)
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
              Programme
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
                placeholder="08.12.2025 - 12.12.2025"
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
                <option>Physical</option>
              </select>
            </label>

            <div className="btns">
              <button className="primary" type="submit">
                {editingId ? "Update" : "Add"}
              </button>
              <button className="ghost" type="button" onClick={resetForm}>
                {editingId ? "Cancel" : "Clear"}
              </button>
            </div>

            <div className="note">Tip: Date / Code / Programme are required.</div>
          </form>
        </div>
      )}

      <footer className="footer">
        Saved locally in browser (localStorage). Later we can connect DB.
      </footer>
    </div>
  );
}