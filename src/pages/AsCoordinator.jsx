import { useMemo, useState, useContext } from "react";
import "./AsCoordinator.css";
import { AuthContext } from "../context/AuthContext";

const INITIAL_DATA = [
  { id: 1, rawDate: "23.03.2026", date: "MAR 2026", code: "EC-27-405", title: "Unmanned and Manned Underwater robots and its applications", duration: "23.03.2026 - 27.03.2026", mode: "Hybrid" },
  { id: 2, rawDate: "23.02.2026", date: "FEB 2026", code: "EC-24-377", title: "Industrial IoT 4.0 and Beyond Empowering Smart Industries", duration: "23.02.2026 - 27.02.2026", mode: "Contact" },
  { id: 3, rawDate: "27.01.2026", date: "JAN 2026", code: "EC-22-344", title: "Role of wireless Sensor Networks", duration: "27.01.2026 - 31.01.2026", mode: "Hybrid" },
  { id: 4, rawDate: "15.12.2025", date: "DEC 2025", code: "NULL", title: "Technical Transformation from I to E (Innovator to Entrepreneur through Incubation) in an Engineering Perspective ()", duration: "15.12.2025 - 19.12.2025", mode: "Contact" },
  { id: 5, rawDate: "01.12.2025", date: "DEC 2025", code: "SP-20", title: "Quality 3P (Paper, patent and Projects ) for an academician from Engineering Perspective", duration: "01.12.2025 - 05.12.2025", mode: "Hybrid" },
  { id: 6, rawDate: "17.11.2025", date: "NOV 2025", code: "EC-20-281", title: "Hands on Training: Drafting and review insights on Technical Proposals for funding", duration: "17.11.2025 - 21.11.2025", mode: "Hybrid" },
  { id: 7, rawDate: "13.10.2025", date: "OCT 2025", code: "EC-17-246", title: "Enabling Modern Communication through Radar and Satellites", duration: "13.10.2025 - 17.10.2025", mode: "Online" },
  { id: 8, rawDate: "15.09.2025", date: "SEP 2025", code: "EC-02-11", title: "Imaging Sensors: Data Interpretation with ML and DL", duration: "15.09.2025 - 19.09.2025", mode: "Online" },
  { id: 9, rawDate: "18.08.2025", date: "AUG 2025", code: "EC-12-177", title: "Underwater Sensors and its Applications", duration: "18.08.2025 - 22.08.2025", mode: "Online" },
  { id: 10, rawDate: "24.03.2025", date: "MAR 2025", code: "ED-67-299", title: "Core and Interdisciplinary Research Methodology and IPR", duration: "24.03.2025 - 28.03.2025", mode: "Online" },
  { id: 11, rawDate: "27.01.2025", date: "JAN 2025", code: "ED-55-256", title: "Effective Funding and Consultancy Proposal Writing", duration: "27.01.2025 - 31.01.2025", mode: "Contact" },
  { id: 12, rawDate: "16.12.2024", date: "DEC 2024", code: "EC-09-229", title: "Communication systems and Its application in Underwater", duration: "16.12.2024 - 20.12.2024", mode: "Online" },
  { id: 13, rawDate: "25.11.2024", date: "NOV 2024", code: "EC-06-204", title: "Role of Underwater sensors in Ocean technology", duration: "25.11.2024 - 29.11.2024", mode: "Online" },
];

function normalize(s) {
  return (s || "").toLowerCase().trim();
}

/* Convert DD.MM.YYYY -> "MMM YYYY" (ex: 30.12.2024 -> "DEC 2024") */
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

/* Sort key for "MMM YYYY" */
function monthYearKey(monYear) {
  const m = /^(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+(\d{4})$/.exec(
    (monYear || "").trim().toUpperCase()
  );
  if (!m) return 0;

  const months = {
    JAN: "01", FEB: "02", MAR: "03", APR: "04",
    MAY: "05", JUN: "06", JUL: "07", AUG: "08",
    SEP: "09", OCT: "10", NOV: "11", DEC: "12",
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

/* ---------- Date helpers ---------- */
function ddmmyyyyToIso(ddmmyyyy) {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec((ddmmyyyy || "").trim());
  if (!m) return "";
  const [, dd, mm, yyyy] = m;
  return `${yyyy}-${mm}-${dd}`;
}

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

function parseDateInputToIsoAndUi(dateInput) {
  const s = (dateInput || "").trim().toUpperCase();

  if (/^\d{2}\.\d{2}\.\d{4}$/.test(s)) {
    const iso = ddmmyyyyToIso(s);
    if (!iso || !isValidIsoDate(iso)) return { displayDateIso: "", uiDate: "" };
    return { displayDateIso: iso, uiDate: s };
  }

  const monYear = /^(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+(\d{4})$/.exec(s);
  if (monYear) {
    const monMap = {
      JAN: "01", FEB: "02", MAR: "03", APR: "04",
      MAY: "05", JUN: "06", JUL: "07", AUG: "08",
      SEP: "09", OCT: "10", NOV: "11", DEC: "12",
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

function parseDuration(duration) {
  const parts = (duration || "").replace(/[–—]/g, "-").split("-").map((s) => s.trim());
  return { startDD: parts[0] || "", endDD: parts[1] || "" };
}

export default function AsCoordinator() {
  const { isAdmin } = useContext(AuthContext);

  const [q, setQ] = useState("");
  // Load initial hardcoded data directly
  const [items, setItems] = useState(INITIAL_DATA); 

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    date: "", 
    code: "",
    title: "",
    duration: "", 
    mode: "Contact",
  });

  const filteredItems = useMemo(() => {
    const query = normalize(q);
    if (!query) return items;

    return items.filter((it) =>
      normalize(
        `${it.date} ${it.rawDate || ""} ${it.code} ${it.title} ${it.duration} ${it.mode}`
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
    setForm({ date: "", code: "", title: "", duration: "", mode: "Contact" });
  }

  /* ADD or UPDATE using local state */
  function onSubmit(e) {
    e.preventDefault();

    const dateInput = form.date.trim(); 
    const code = form.code.trim();
    const title = form.title.trim();
    const duration = form.duration.trim();
    const mode = form.mode;

    if (!dateInput || !code || !title) {
      alert("Please fill Date, Code, and Programme.");
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

    const rawDateDD = uiDate || dateInput;

    const uiItem = {
      id: editingId ? editingId : Date.now(), // Generate local ID if new
      rawDate: rawDateDD,
      date: monthYearFromDDMMYYYY(rawDateDD),
      code,
      title,
      duration,
      mode,
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
      code: item.code || "",
      title: item.title || "",
      duration: item.duration || "",
      mode: item.mode || "Contact",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* DELETE from local state */
  function onDelete(id) {
    if (!confirm("Delete this programme?")) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  function resetAll() {
    setQ("");
    resetForm();
  }

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-left">
          <h1>Professional Development Programmes (PDP) - As Coordinator</h1>
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
            <button className="ghost" onClick={resetAll} title="Clear search/form">
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

            <div className="btns">
              <button className="primary" type="submit">
                {editingId ? "Update" : "Add"}
              </button>
              <button className="ghost" type="button" onClick={resetForm}>
                {editingId ? "Cancel" : "Clear"}
              </button>
            </div>

            <div className="note">
              Tip: Date / Code / Programme are required. Date supports DD.MM.YYYY or JAN 2025.
            </div>
          </form>
        </div>
      )}

      <footer className="footer">Running on static local data (No Database Connected).</footer>
    </div>
  );
}