// src/pages/HostInstitution.jsx
import { useEffect, useMemo, useState, useContext } from "react";
import "./AsCoordinator.css";
import { AuthContext } from "../context/AuthContext";

// ✅ CHANGE THIS ENDPOINT to your Host Institution API
const API_BASE = "http://10.22.39.232:8080/api/host-institution-programmes";

function normalize(s) {
  return (s || "").toLowerCase().trim();
}

/* ✅ Convert DD.MM.YYYY -> "MMM YYYY" (ex: 30.12.2024 -> "DEC 2024") */
function monthYearFromDDMMYYYY(ddmmyyyy) {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(ddmmyyyy || "");
  if (!m) return "—";
  const [, , mm, yy] = m;

  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
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
    JAN: "01",
    FEB: "02",
    MAR: "03",
    APR: "04",
    MAY: "05",
    JUN: "06",
    JUL: "07",
    AUG: "08",
    SEP: "09",
    OCT: "10",
    NOV: "11",
    DEC: "12",
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

/* ---------- Date helpers (UI <-> DB) ---------- */

/** DD.MM.YYYY -> YYYY-MM-DD */
function ddmmyyyyToIso(ddmmyyyy) {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec((ddmmyyyy || "").trim());
  if (!m) return "";
  const [, dd, mm, yyyy] = m;
  return `${yyyy}-${mm}-${dd}`;
}

/** YYYY-MM-DD -> DD.MM.YYYY */
function isoToDDMMYYYY(iso) {
  if (!iso) return "";
  const s = String(iso);
  const pure = s.length >= 10 ? s.slice(0, 10) : s;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(pure);
  if (!m) return "";
  const [, yyyy, mm, dd] = m;
  return `${dd}.${mm}.${yyyy}`;
}

/** ✅ Validate a real calendar date (rejects 31.02.2004 etc.) */
function isValidIsoDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((iso || "").trim());
  if (!m) return false;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === mo - 1 &&
    dt.getUTCDate() === d
  );
}

/** ✅ Accepts BOTH:
 *  - "31.12.2025"
 *  - "JAN 2025"
 * Returns:
 *  displayDateIso: "YYYY-MM-DD"
 *  uiDate: always "DD.MM.YYYY" (for storing in rawDate / input)
 */
function parseDateInputToIsoAndUi(dateInput) {
  const s = (dateInput || "").trim().toUpperCase();

  // DD.MM.YYYY
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(s)) {
    const iso = ddmmyyyyToIso(s);
    if (!iso || !isValidIsoDate(iso)) return { displayDateIso: "", uiDate: "" };
    return { displayDateIso: iso, uiDate: s };
  }

  // "JAN 2025"
  const monYear =
    /^(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+(\d{4})$/.exec(s);
  if (monYear) {
    const monMap = {
      JAN: "01",
      FEB: "02",
      MAR: "03",
      APR: "04",
      MAY: "05",
      JUN: "06",
      JUL: "07",
      AUG: "08",
      SEP: "09",
      OCT: "10",
      NOV: "11",
      DEC: "12",
    };
    const mm = monMap[monYear[1]];
    const yyyy = monYear[2];

    // store/display the date as 1st of that month
    const iso = `${yyyy}-${mm}-01`;
    const ui = `01.${mm}.${yyyy}`;

    if (!isValidIsoDate(iso)) return { displayDateIso: "", uiDate: "" };
    return { displayDateIso: iso, uiDate: ui };
  }

  return { displayDateIso: "", uiDate: "" };
}

function parseDuration(duration) {
  // Expected: "08.12.2025 - 12.12.2025"
  const parts = (duration || "")
    .replace(/[–—]/g, "-")
    .split("-")
    .map((s) => s.trim());
  return { startDD: parts[0] || "", endDD: parts[1] || "" };
}

export default function HostInstitution() {
  const { isAdmin } = useContext(AuthContext);

  const [q, setQ] = useState("");
  const [items, setItems] = useState([]); // ✅ DB is the source now
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    date: "", // DD.MM.YYYY OR "JAN 2025"
    code: "",
    title: "",
    duration: "", // "DD.MM.YYYY - DD.MM.YYYY"
    mode: "Contact",
    hostInstitutionName: "", // ✅ NEW FIELD
  });

  /* ✅ Load from DB on page load */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(API_BASE);
        if (!res.ok) throw new Error("Failed to load host institution programmes");
        const data = await res.json();

        const mapped = (data || []).map((row) => {
          const rawDate = isoToDDMMYYYY(row.displayDate);
          const start = isoToDDMMYYYY(row.startDate);
          const end = isoToDDMMYYYY(row.endDate);

          return {
            id: row.id,
            rawDate,
            date: monthYearFromDDMMYYYY(rawDate),
            code: row.code || "",
            title: row.programme || "",
            duration: `${start} - ${end}`.trim(),
            mode: row.mode || "Contact",
            hostInstitutionName: row.hostInstitutionName || row.hostInstitution || "",
          };
        });

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
        `${it.date} ${it.rawDate || ""} ${it.code} ${it.title} ${it.duration} ${it.mode} ${it.hostInstitutionName}`
      ).includes(query)
    );
  }, [items, q]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const it of filteredItems) {
      const key = it.date || "—";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(it);
    }

    const entries = Array.from(map.entries());

    for (const [, arr] of entries) {
      arr.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

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
      hostInstitutionName: "",
    });
  }

  async function onSubmit(e) {
    e.preventDefault();

    const dateInput = form.date.trim();
    const code = form.code.trim();
    const title = form.title.trim();
    const duration = form.duration.trim();
    const mode = form.mode;
    const hostInstitutionName = form.hostInstitutionName.trim();

    if (!dateInput || !code || !title || !hostInstitutionName) {
      alert("Please fill Date, Code, Programme, and Host Institution Name.");
      return;
    }

    const { displayDateIso, uiDate } = parseDateInputToIsoAndUi(dateInput);
    if (!displayDateIso) {
      alert('Date must be "DD.MM.YYYY" (example: 31.12.2025) OR "JAN 2025".');
      return;
    }

    const { startDD, endDD } = parseDuration(duration);
    const startIso = ddmmyyyyToIso(startDD);
    const endIso = ddmmyyyyToIso(endDD);

    if (!startIso || !endIso || !isValidIsoDate(startIso) || !isValidIsoDate(endIso)) {
      alert('Duration must be "DD.MM.YYYY - DD.MM.YYYY" (example: 08.12.2025 - 12.12.2025).');
      return;
    }

    const payload = {
      displayDate: displayDateIso,
      code,
      programme: title,
      startDate: startIso,
      endDate: endIso,
      mode,
      hostInstitutionName, // ✅ NEW FIELD
    };

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
      const saved = await res.json();

      const rawDateDD = uiDate || dateInput;

      const uiItem = {
        id: saved.id,
        rawDate: rawDateDD,
        date: monthYearFromDDMMYYYY(rawDateDD),
        code,
        title,
        duration,
        mode,
        hostInstitutionName,
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
      date: item.rawDate || "",
      code: item.code || "",
      title: item.title || "",
      duration: item.duration || "",
      mode: item.mode || "Contact",
      hostInstitutionName: item.hostInstitutionName || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

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
            placeholder="Search: month / year / code / programme / mode / host..."
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
                <option>Hybrid</option>
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
              Tip: Date / Code / Programme / Host Institution Name are required.
            </div>
          </form>
        </div>
      )}

      <footer className="footer">Now using database (MySQL) via Spring Boot API.</footer>
    </div>
  );
}