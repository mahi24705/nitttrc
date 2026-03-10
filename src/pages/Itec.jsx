// src/pages/Itec.jsx
import { useMemo, useState, useContext } from "react";
import "./AsCoordinator.css";
import { AuthContext } from "../context/AuthContext";

const INITIAL_DATA = [
  {
    id: 1,
    rawDate: "17.09.2025",
    date: "SEP 2025",
    code: "Null",
    title: "Leveraging Drone Technology for Achieving Sustainable Development Goals (SDGs) and Promoting Entrepreneurship",
    duration: "17.09.2025 - 30.09.2025",
    mode: "Contact",
    role: "Resource Person",
  },
  {
    id: 2,
    rawDate: "01.02.2025", // Used 01.02.2025 to group under FEB 2025
    date: "FEB 2025",
    code: "Null",
    title: "Skill Development in Electronics for TVET Trainers and Planners",
    duration: "09:30 am - 12:45 pm",
    mode: "Contact",
    role: "Resource Person",
  }
];

function normalize(s) {
  return (s || "").toLowerCase().trim();
}

/** ✅ Convert date to "MMM YYYY" */
function monthYearFromAny(dateStr) {
  const s = (dateStr || "").trim();

  // DD.MM.YYYY / DD-MM-YYYY / DD/MM/YYYY
  let m = /^(\d{2})[.\-/](\d{2})[.\-/](\d{4})$/.exec(s);
  if (m) {
    const mm = Number(m[2]);
    const yy = m[3];
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    return `${months[mm - 1] || "—"} ${yy}`;
  }

  // ISO YYYY-MM-DD
  m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) {
    const yy = m[1];
    const mm = Number(m[2]);
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    return `${months[mm - 1] || "—"} ${yy}`;
  }

  return "—";
}

function monthYearFromDDMMYYYY(ddmmyyyy) {
  const iso = ddmmyyyyToIso(ddmmyyyy);
  return monthYearFromAny(iso || ddmmyyyy);
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
  if (mode === "Hybrid") return "pill hybrid";
  return "pill other";
}

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

/** ✅ Validate real calendar date */
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

/** Accepts BOTH "31.12.2025" and "JAN 2025" */
function parseDateInputToIsoAndUi(dateInput) {
  const s = (dateInput || "").trim().toUpperCase();

  if (/^\d{2}\.\d{2}\.\d{4}$/.test(s)) {
    const iso = ddmmyyyyToIso(s);
    if (!iso || !isValidIsoDate(iso)) {
      return { displayDateIso: "", uiDate: "" };
    }
    return { displayDateIso: iso, uiDate: s };
  }

  const monYear = /^(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+(\d{4})$/.exec(s);

  if (monYear) {
    const monMap = {
      JAN: "01", FEB: "02", MAR: "03", APR: "04", MAY: "05", JUN: "06",
      JUL: "07", AUG: "08", SEP: "09", OCT: "10", NOV: "11", DEC: "12",
    };
    const mm = monMap[monYear[1]];
    const yyyy = monYear[2];
    const iso = `${yyyy}-${mm}-01`;
    const ui = `01.${mm}.${yyyy}`;
    if (!isValidIsoDate(iso)) {
      return { displayDateIso: "", uiDate: "" };
    }
    return { displayDateIso: iso, uiDate: ui };
  }

  return { displayDateIso: "", uiDate: "" };
}

/* ===================== ✅ Duration supports Date OR Time ===================== */

function normalizeTimeToken(s) {
  return (s || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ")
    .replace(/^(\d{1,2}):(\d{2})(AM|PM)$/i, "$1:$2 $3")
    .replace(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i, "$1:$2 $3");
}

function isValidTimeToken(s) {
  const t = normalizeTimeToken(s);
  const m = /^(\d{1,2}):(\d{2}) (AM|PM)$/.exec(t);
  if (!m) return false;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  return hh >= 1 && hh <= 12 && mm >= 0 && mm <= 59;
}

function extractDateDDMMYYYY(text) {
  const m = /^(\d{2}\.\d{2}\.\d{4})\b/.exec((text || "").trim());
  return m ? m[1] : "";
}

function removeLeadingDate(text) {
  return (text || "")
    .trim()
    .replace(/^\d{2}\.\d{2}\.\d{4}\s*/g, "")
    .trim();
}

function splitRange(raw) {
  const s = (raw || "").trim().replace(/[–—]/g, "-");
  const parts = s.split("-").map((x) => x.trim()).filter(Boolean);

  if (parts.length >= 2) {
    return { left: parts[0], right: parts.slice(1).join(" - ") };
  }

  return { left: "", right: "" };
}

function parseDurationFlexible(durationInput, displayDateIso) {
  const raw = (durationInput || "").trim();
  if (!raw) {
    return { ok: false, startIso: "", endIso: "", err: "Duration required." };
  }

  const { left, right } = splitRange(raw);
  if (!left || !right) {
    return {
      ok: false,
      startIso: "",
      endIso: "",
      err: 'Use "Start - End" format (example: 21.02.2025 - 22.02.2025 or 09:00 am - 12:30 pm).',
    };
  }

  const leftDateDD = extractDateDDMMYYYY(left);
  const rightDateDD = extractDateDDMMYYYY(right);

  const leftRest = removeLeadingDate(left);
  const rightRest = removeLeadingDate(right);

  if (leftDateDD) {
    const startIso = ddmmyyyyToIso(leftDateDD);
    if (!startIso || !isValidIsoDate(startIso)) {
      return { ok: false, startIso: "", endIso: "", err: "Invalid start date in Duration." };
    }

    let endIso = "";
    if (rightDateDD) {
      endIso = ddmmyyyyToIso(rightDateDD);
      if (!endIso || !isValidIsoDate(endIso)) {
        return { ok: false, startIso: "", endIso: "", err: "Invalid end date in Duration." };
      }
    } else {
      endIso = startIso;
    }

    if (leftRest && !isValidTimeToken(leftRest)) {
      return { ok: false, startIso: "", endIso: "", err: 'Invalid start time. Use like "09:00 am".' };
    }

    if (rightRest && !isValidTimeToken(rightRest)) {
      return { ok: false, startIso: "", endIso: "", err: 'Invalid end time. Use like "12:30 pm".' };
    }

    return { ok: true, startIso, endIso, err: "" };
  }

  const t1 = normalizeTimeToken(left);
  const t2 = normalizeTimeToken(right);

  if (!isValidTimeToken(t1) || !isValidTimeToken(t2)) {
    return { ok: false, startIso: "", endIso: "", err: 'Time range must be like "09:00 am - 12:30 pm".' };
  }

  if (!displayDateIso || !isValidIsoDate(displayDateIso)) {
    return { ok: false, startIso: "", endIso: "", err: 'For time-only duration, the main "Date" field must be valid.' };
  }

  return { ok: true, startIso: displayDateIso, endIso: displayDateIso, err: "" };
}

/* ===================== END Duration ===================== */

export default function Itec() {
  const { isAdmin } = useContext(AuthContext);

  const [q, setQ] = useState("");
  // Local state initialized with raw data
  const [items, setItems] = useState(INITIAL_DATA);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    date: "",
    code: "",
    title: "",
    duration: "",
    mode: "Contact",
    role: "Coordinator",
  });

  const filteredItems = useMemo(() => {
    const query = normalize(q);
    if (!query) return items;

    return items.filter((it) =>
      normalize(
        `${it.date} ${it.rawDate || ""} ${it.code} ${it.title} ${it.duration} ${it.mode} ${it.role}`
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
      role: "Coordinator",
    });
  }

  function resetAll() {
    setQ("");
    resetForm();
  }

  function reloadData() {
    setItems(INITIAL_DATA);
    setQ("");
  }

  function onSubmit(e) {
    e.preventDefault();

    const dateInput = form.date.trim();
    const code = form.code.trim();
    const title = form.title.trim();
    const duration = form.duration.trim();

    if (!dateInput || !title) {
      alert("Please fill Date and Programme Title.");
      return;
    }

    const { displayDateIso, uiDate } = parseDateInputToIsoAndUi(dateInput);
    if (!displayDateIso) {
      alert('Date must be "DD.MM.YYYY" (31.12.2025) OR "JAN 2025".');
      return;
    }

    const dur = parseDurationFlexible(duration, displayDateIso);
    if (!dur.ok) {
      alert(dur.err);
      return;
    }

    const rawDateDD = uiDate || dateInput;
    const uiItem = {
      id: editingId ? editingId : Date.now(),
      rawDate: rawDateDD,
      date: monthYearFromDDMMYYYY(rawDateDD),
      code: code || "Null",
      title,
      duration,
      mode: form.mode,
      role: form.role,
    };

    if (editingId) {
      setItems((prev) => prev.map((it) => (it.id === editingId ? uiItem : it)));
    } else {
      setItems((prev) => [uiItem, ...prev]);
    }

    resetForm();
  }

  function onEdit(item) {
    setEditingId(item.id);
    setForm({
      date: item.rawDate || "",
      code: item.code === "Null" || item.code === "—" ? "" : item.code,
      title: item.title || "",
      duration: item.duration === "—" ? "" : item.duration,
      mode: item.mode || "Contact",
      role: item.role || "Coordinator",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onDelete(id) {
    if (!window.confirm("Delete this programme?")) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-left">
          <h1>ITEC Programmes</h1>
          <p>Programmes via ITEC</p>
        </div>

        <div className="hero-right">
          <input
            className="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search: month / year / code / programme / mode / role..."
          />

          {isAdmin && (
            <button className="ghost" onClick={resetAll} title="Clear search/form">
              Reset
            </button>
          )}

          <button className="ghost" onClick={reloadData} title="Reload Data">
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
                  <div>Role</div>
                  <div>Action</div>
                </div>

                {arr.map((it, idx) => (
                  <div className="tr" key={it.id}>
                    <div className="muted">{idx + 1}</div>
                    <div className="code">{it.code || "—"}</div>
                    <div className="programme">{it.title || "—"}</div>
                    <div className="muted">{it.duration || "—"}</div>
                    <div>
                      <span className={pillClass(it.mode)}>{it.mode}</span>
                    </div>
                    <div className="muted">{it.role}</div>

                    <div className="actions">
                      {isAdmin ? (
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
                placeholder="Code (optional)"
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
              Duration (Date or Time)
              <input
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="02.02.2025 - 03.02.2025"
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
              Role
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option>Coordinator</option>
                <option>Resource Person</option>
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

            <div className="note">
              Tip: Duration supports:
              <br />• 21.02.2025 - 22.02.2025
              <br />• 09:00 am - 12:30 pm
              <br />• 21.02.2025 09:00 am - 22.02.2025 12:30 pm
              <br />• 21.02.2025 09:00 am - 12:30 pm
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