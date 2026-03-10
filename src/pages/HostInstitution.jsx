// src/pages/HostInstitution.jsx
import { useMemo, useState, useContext } from "react";
import "./AsCoordinator.css";
import { AuthContext } from "../context/AuthContext";

const INITIAL_DATA = [
  {
    id: 1,
    rawDate: "27.03.2025",
    date: "MAR 2025",
    code: "—",
    title: "Writing Successful Research Proposals for Funding",
    duration: "27.03.2025 - 27.03.2025",
    mode: "Contact",
    hostInstitutionName: "Coimbatore Institute of Technology (CIT)",
  }
];

function normalize(s) {
  return (s || "").toLowerCase().trim();
}

/** ✅ Convert DD.MM.YYYY -> "MMM YYYY" */
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

/** ✅ Sort key for "MMM YYYY" */
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

/** Validate date input (DD.MM.YYYY or MMM YYYY) */
function parseDateInputToUi(dateInput) {
  const s = (dateInput || "").trim().toUpperCase();

  if (/^\d{2}\.\d{2}\.\d{4}$/.test(s)) {
    return s;
  }

  const monYear = /^(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+(\d{4})$/.exec(s);
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

export default function HostInstitution() {
  const { isAdmin } = useContext(AuthContext);

  const [q, setQ] = useState("");
  // Using Local state initialized with raw data
  const [items, setItems] = useState(INITIAL_DATA);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    date: "",
    code: "",
    title: "",
    duration: "",
    mode: "Contact",
    hostInstitutionName: "",
  });

  const filteredItems = useMemo(() => {
    const query = normalize(q);
    if (!query) return items;

    return items.filter((it) =>
      normalize(
        `${it.date} ${it.code} ${it.title} ${it.duration} ${it.mode} ${it.hostInstitutionName}`
      ).includes(query)
    );
  }, [items, q]);

  // Grouping logic based on Month and Year
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
    const institutionName = form.hostInstitutionName.trim();

    if (!dateInput || !title || !duration || !institutionName) {
      alert("Please fill Date, Title, Duration and Host Institution Name.");
      return;
    }

    const rawDateDD = parseDateInputToUi(dateInput);
    if (!rawDateDD) {
      alert('Date must be "DD.MM.YYYY" (31.12.2025) OR "JAN 2025".');
      return;
    }

    const uiItem = {
      id: editingId ? editingId : Date.now(),
      rawDate: rawDateDD,
      date: monthYearFromDDMMYYYY(rawDateDD),
      code: code || "—",
      title,
      duration,
      mode: form.mode,
      hostInstitutionName: institutionName,
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
      code: item.code === "—" ? "" : item.code,
      title: item.title || "",
      duration: item.duration || "",
      mode: item.mode || "Contact",
      hostInstitutionName: item.hostInstitutionName || "",
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
          <button className="ghost" onClick={reloadData} title="Reload Data">
            Refresh
          </button>
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

              <div className="table" style={{ gridTemplateColumns: 'auto auto 1fr auto auto 1fr auto' }}>
                <div className="tr head" style={{ display: 'grid', gridTemplateColumns: '60px 80px 1fr 180px 100px 1fr 140px' }}>
                  <div>S.No</div>
                  <div>Code</div>
                  <div>Title</div>
                  <div>Duration</div>
                  <div>Mode</div>
                  <div>Host Institution</div>
                  <div>Action</div>
                </div>

                {arr.map((it, idx) => (
                  <div className="tr" key={it.id} style={{ display: 'grid', gridTemplateColumns: '60px 80px 1fr 180px 100px 1fr 140px' }}>
                    <div className="muted">{idx + 1}</div>
                    <div className="code">{it.code}</div>
                    <div className="programme">{it.title}</div>
                    <div className="muted">{it.duration}</div>
                    <div>
                      <span className={pillClass(it.mode)}>{it.mode}</span>
                    </div>
                    <div className="muted" style={{ wordBreak: 'break-word' }}>{it.hostInstitutionName}</div>

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
                placeholder="27.03.2025  (or)  JAN 2025"
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
                placeholder="27.03.2025 - 27.03.2025"
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
                placeholder="Coimbatore Institute of Technology (CIT)"
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
              Tip: Date, Title, Duration and Host Institution Name are required.
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