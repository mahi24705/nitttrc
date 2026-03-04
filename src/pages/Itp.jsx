// src/pages/Itp.jsx
import { useEffect, useMemo, useState, useContext } from "react";
import "./PdpResource.css"; // ✅ reuse same UI CSS
import { AuthContext } from "../context/AuthContext";

// ✅ CHANGE this endpoint to your ITP API
const API = "http://10.22.39.232:8080/api/itp";

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

/** DD.MM.YYYY -> YYYY-MM-DD */
function ddmmyyyyToIso(ddmmyyyy) {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec((ddmmyyyy || "").trim());
  if (!m) return "";
  const [, dd, mm, yy] = m;
  return `${yy}-${mm}-${dd}`;
}

/** YYYY-MM-DD -> DD.MM.YYYY */
function isoToDdmmyyyy(iso) {
  if (!iso) return "—";
  const s = String(iso);
  const pure = s.length >= 10 ? s.slice(0, 10) : s;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(pure.trim());
  if (!m) return "—";
  const [, yy, mm, dd] = m;
  return `${dd}.${mm}.${yy}`;
}

/** ✅ Validate a real calendar date */
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

/** ✅ Accepts BOTH "31.12.2025" and "JAN 2025" */
function parseDateInputToIsoAndUi(dateInput) {
  const s = (dateInput || "").trim().toUpperCase();

  if (/^\d{2}\.\d{2}\.\d{4}$/.test(s)) {
    const iso = ddmmyyyyToIso(s);
    if (!iso || !isValidIsoDate(iso)) return { displayDateIso: "", uiDate: "" };
    return { displayDateIso: iso, uiDate: s };
  }

  const monYear =
    /^(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+(\d{4})$/.exec(s);

  if (monYear) {
    const monMap = {
      JAN: "01", FEB: "02", MAR: "03", APR: "04", MAY: "05", JUN: "06",
      JUL: "07", AUG: "08", SEP: "09", OCT: "10", NOV: "11", DEC: "12",
    };
    const mm = monMap[monYear[1]];
    const yyyy = monYear[2];
    const iso = `${yyyy}-${mm}-01`;
    const ui = `01.${mm}.${yyyy}`;
    if (!isValidIsoDate(iso)) return { displayDateIso: "", uiDate: "" };
    return { displayDateIso: iso, uiDate: ui };
  }

  return { displayDateIso: "", uiDate: "" };
}

/** Duration: "05.01.2026 - 09.01.2026" */
function parseDurationToIsoRange(duration) {
  const s = (duration || "")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

  if (!s) return { startIso: "", endIso: "" };

  const parts = s.includes(" to ")
    ? s.split(" to ")
    : s.split("-").map((x) => x.trim());

  const start = (parts[0] || "").trim();
  const end = (parts[1] || "").trim();

  return { startIso: ddmmyyyyToIso(start), endIso: ddmmyyyyToIso(end) };
}

function makeDurationDdMm(startIso, endIso) {
  if (!startIso || !endIso) return "—";
  return `${isoToDdmmyyyy(startIso)} - ${isoToDdmmyyyy(endIso)}`;
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
    date: "",        // grouping date (month header)
    code: "",
    title: "",
    duration: "",
    mode: "Contact",
    sessionDate: "", // ✅ actual session date shown in table
  });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErrMsg("");

        const res = await fetch(API);
        if (!res.ok) throw new Error(`GET failed: ${res.status}`);
        const data = await res.json();

        const ui = (data || []).map((x) => ({
          id: x.id,
          date: isoToDdmmyyyy(x.displayDate),
          sessionDate: isoToDdmmyyyy(x.displayDate),
          code: x.code || "—",
          title: x.programme || "—",
          duration: makeDurationDdMm(x.startDate, x.endDate),
          mode: x.mode || "—",
        }));

        setItems(ui);
      } catch (e) {
        console.error(e);
        setErrMsg("Could not load data from backend. Check Spring Boot + CORS.");
      } finally {
        setLoading(false);
      }
    })();
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

    const { uiDate: groupUi } = parseDateInputToIsoAndUi(payloadUI.date);

    const { displayDateIso: sessionIso, uiDate: sessionUi } =
      parseDateInputToIsoAndUi(payloadUI.sessionDate);

    if (!sessionIso) {
      alert('Session Date must be "DD.MM.YYYY" OR "JAN 2025".');
      return;
    }

    const { startIso, endIso } = parseDurationToIsoRange(payloadUI.duration);
    if (!startIso || !endIso || !isValidIsoDate(startIso) || !isValidIsoDate(endIso)) {
      alert("Duration must be DD.MM.YYYY - DD.MM.YYYY");
      return;
    }

    const body = {
      displayDate: sessionIso,
      code: payloadUI.code,
      programme: payloadUI.title,
      startDate: startIso,
      endDate: endIso,
      mode: payloadUI.mode,
    };

    try {
      setErrMsg("");

      if (editingId) {
        const res = await fetch(`${API}/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`PUT failed: ${res.status}`);
        const saved = await res.json();

        const updated = {
          id: saved.id,
          date: groupUi || payloadUI.date,
          sessionDate: isoToDdmmyyyy(saved.displayDate),
          code: saved.code,
          title: saved.programme,
          duration: makeDurationDdMm(saved.startDate, saved.endDate),
          mode: saved.mode,
        };

        setItems((prev) => prev.map((it) => (it.id === editingId ? updated : it)));
      } else {
        const res = await fetch(API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`POST failed: ${res.status}`);
        const saved = await res.json();

        const created = {
          id: saved.id,
          date: groupUi || payloadUI.date,
          sessionDate: isoToDdmmyyyy(saved.displayDate),
          code: saved.code,
          title: saved.programme,
          duration: makeDurationDdMm(saved.startDate, saved.endDate),
          mode: saved.mode,
        };

        setItems((prev) => [created, ...prev]);
      }

      setForm((f) => ({
        ...f,
        date: groupUi || f.date,
        sessionDate: sessionUi || f.sessionDate,
      }));

      resetForm();
    } catch (e) {
      console.error(e);
      setErrMsg("Save failed. Check backend logs / CORS / date formats.");
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
      sessionDate: item.sessionDate || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onDelete(id) {
    if (!confirm("Delete this programme?")) return;
    try {
      setErrMsg("");
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`DELETE failed: ${res.status}`);
      setItems((prev) => prev.filter((it) => it.id !== id));
    } catch (e) {
      console.error(e);
      setErrMsg("Delete failed. Check backend logs / CORS.");
    }
  }

  async function refreshFromDb() {
    try {
      setLoading(true);
      setErrMsg("");
      const res = await fetch(API);
      if (!res.ok) throw new Error(`GET failed: ${res.status}`);
      const data = await res.json();

      const ui = (data || []).map((x) => ({
        id: x.id,
        date: isoToDdmmyyyy(x.displayDate),
        sessionDate: isoToDdmmyyyy(x.displayDate),
        code: x.code || "—",
        title: x.programme || "—",
        duration: makeDurationDdMm(x.startDate, x.endDate),
        mode: x.mode || "—",
      }));

      setItems(ui);
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