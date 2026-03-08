import { useMemo, useState, useContext } from "react";
import "./AsCoordinator.css";
import { AuthContext } from "../context/AuthContext";

const RAW_DC = [
  {
    id: 1,
    month: "DEC 2024",
    scholar: "Mr. K. Balaji",
    institution: "Anna University",
    mode: "Online",
    date: "03.12.2024",
    details:
      "Conducted Doctoral Committee (DC) meeting for the scholar Mr. K. Balaji (Anna University).",
  },
  {
    id: 2,
    month: "DEC 2024",
    scholar: "Ms. H. Mary Shyni (RC2113004011026)",
    institution: "SRM Kattankulathur",
    mode: "Online",
    date: "12.12.2024",
    details:
      "Served as Doctoral Committee (DC) member for Research scholar Ms. H. Mary Shyni.",
  },
  {
    id: 3,
    month: "DEC 2024",
    scholar: "Mr. Janarthanan M",
    institution: "SRM Vadapalani",
    mode: "Online",
    date: "30.12.2024",
    details:
      "Served as Doctoral Committee (DC) member for Research scholar Mr. Janarthanan M.",
  },
  {
    id: 4,
    month: "JAN 2025",
    scholar: "Dr. K. Chitra (PC2513004013002)",
    institution: "SRM University, Kattankulathur",
    mode: "Online",
    date: "28.01.2025",
    details:
      "Served as Doctoral Committee member for the first DC meeting of the scholar Dr. K. Chitra.",
  },
  {
    id: 5,
    month: "FEB 2025",
    scholar: "Ramya S (RA2213004011004)",
    institution: "SRM University, Kattankulathur",
    mode: "Online",
    date: "10.02.2025",
    details:
      "Served as Doctoral Committee member for Ph.D. Comprehensive Examination Meeting of Ramya S.",
  },
  {
    id: 6,
    month: "FEB 2025",
    scholar: "Academic Activities Committee",
    institution: "Institute Level",
    mode: "Offline",
    date: "15.02.2025",
    details:
      "Served as Committee member to fix the norms for availing SCL/OD for participating and attending academic activities outside the institute. Report submitted to Director.",
  },
  {
    id: 7,
    month: "FEB 2025",
    scholar: "Technical Evaluation Committee",
    institution: "IIT Tirupati Navavishkar I-Hub Foundation (IITTNiF)",
    mode: "Online",
    date: "17.02.2025 - 18.02.2025",
    details:
      "Served as Expert Member in the Technical Evaluation Committee for second round proposal evaluations under the Underwater Navigation Call for Proposals.",
  },
  {
    id: 8,
    month: "FEB 2025",
    scholar: "Ms. N. T. Velusudha",
    institution: "SSN College of Engineering",
    mode: "Online",
    date: "18.02.2025",
    details:
      "Served as Doctoral Committee member for first DC meeting of Ph.D. scholar Ms. N. T. Velusudha.",
  },
  {
    id: 9,
    month: "FEB 2025",
    scholar: "Ms. Bharanidivya M (RA2313004011006)",
    institution: "SRM Institute of Science and Technology",
    mode: "Online",
    date: "27.02.2025",
    details:
      "Served as Doctoral Committee member for Comprehensive exam of Ph.D. scholar Ms. Bharanidivya M.",
  },
  {
    id: 10,
    month: "JUL 2025",
    scholar: "Mr. M. Vimalraj",
    institution: "Part Time Scholar",
    mode: "Online",
    date: "09.07.2025",
    details:
      "Conducted DC meeting for part time scholar Mr. M. Vimalraj.",
  },
  {
    id: 11,
    month: "SEP 2025",
    scholar: "Ms. T. Kamizhelakkiya",
    institution: "SRM University",
    mode: "Offline",
    date: "23.09.2025",
    details:
      "Served as Doctor Committee member for synopsis meeting of Ms. T. Kamizhelakkiya.",
  },
  {
    id: 12,
    month: "OCT 2025",
    scholar: "Ms. Moganavalli C B (Reg No 2522043204)",
    institution: "RAP Meeting",
    mode: "Online",
    date: "24.10.2025",
    details:
      "Served as Doctor Committee member in the first RAP meeting for Ms. Moganavalli C B.",
  },
  {
    id: 13,
    month: "OCT 2025",
    scholar: "Mr. Senthil Vel Murugan E (Reg No 2521043207)",
    institution: "RAP Meeting",
    mode: "Online",
    date: "24.10.2025",
    details:
      "Served as Doctor Committee member in the first RAP meeting for Mr. Senthil Vel Murugan E.",
  },
  {
    id: 14,
    month: "NOV 2025",
    scholar: "PhD Scholar",
    institution: "Anna University",
    mode: "Online",
    date: "21.11.2025",
    details:
      "Conducted Doctoral Committee meeting for my PhD scholar (Anna University).",
  },
  {
    id: 15,
    month: "JAN 2026",
    scholar: "Ms. S. Aruna Devi",
    institution: "Anna University",
    mode: "Online",
    date: "12.01.2026",
    details:
      "Dr. S. Sakthivel Murugan served as Doctor Committee member for Ms. S. Aruna Devi.",
  },
  {
    id: 16,
    month: "JAN 2026",
    scholar: "Ms. S. V. Sarojini",
    institution: "Anna University",
    mode: "Online",
    date: "20.01.2026",
    details:
      "Dr. S. Sakthivel Murugan served as Doctor Committee member for Ms. S. V. Sarojini.",
  },
];

function normalize(s) {
  return (s || "").toLowerCase().trim();
}

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

  return Number(`${m[2]}${months[m[1]]}00`);
}

function monthFromDate(ddmmyyyy) {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(ddmmyyyy || "");
  if (!m) return "—";
  const [, , mm, yyyy] = m;

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

  return `${months[Number(mm) - 1] || "—"} ${yyyy}`;
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
      <div style={{ wordBreak: "break-word" }}>{value || "—"}</div>
    </div>
  );
}

export default function Dc() {
  const { user, isAdmin } = useContext(AuthContext);
  const isLoggedIn = !!user;

  const [q, setQ] = useState("");
  const [items, setItems] = useState(RAW_DC);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    scholar: "",
    institution: "",
    mode: "Online",
    date: "",
    details: "",
  });

  const filteredItems = useMemo(() => {
    const query = normalize(q);
    if (!query) return items;

    return items.filter((it) =>
      normalize(
        `${it.month} ${it.scholar} ${it.institution} ${it.mode} ${it.date} ${it.details}`
      ).includes(query)
    );
  }, [items, q]);

  const grouped = useMemo(() => {
    const map = new Map();

    for (const it of filteredItems) {
      const key = it.month || monthFromDate(it.date);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(it);
    }

    const entries = Array.from(map.entries());
    entries.sort((a, b) => monthYearKey(b[0]) - monthYearKey(a[0]));
    return entries;
  }, [filteredItems]);

  function resetForm() {
    setEditingId(null);
    setForm({
      scholar: "",
      institution: "",
      mode: "Online",
      date: "",
      details: "",
    });
  }

  function resetAll() {
    setQ("");
    resetForm();
    setItems(RAW_DC);
  }

  function onEdit(item) {
    setEditingId(item.id);
    setForm({
      scholar: item.scholar || "",
      institution: item.institution || "",
      mode: item.mode || "Online",
      date: item.date || "",
      details: item.details || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onDelete(id) {
    if (!window.confirm("Delete this DC entry?")) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  function onSubmit(e) {
    e.preventDefault();

    const payload = {
      scholar: String(form.scholar || "").trim(),
      institution: String(form.institution || "").trim(),
      mode: String(form.mode || "").trim(),
      date: String(form.date || "").trim(),
      details: String(form.details || "").trim(),
    };

    if (!payload.scholar || !payload.institution || !payload.date) {
      alert("Please fill Scholar, Institution, and Date.");
      return;
    }

    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(payload.date)) {
      alert('Date must be in "DD.MM.YYYY" format.');
      return;
    }

    const uiItem = {
      id: editingId || Date.now(),
      month: monthFromDate(payload.date),
      ...payload,
    };

    if (editingId) {
      setItems((prev) => prev.map((it) => (it.id === editingId ? uiItem : it)));
    } else {
      setItems((prev) => [uiItem, ...prev]);
    }

    resetForm();
  }

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-left">
          <h1>DC</h1>
          <p>Doctoral Committee Activities</p>
        </div>

        <div className="hero-right">
          <input
            className="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search: month / scholar / institution / mode..."
          />

          <button className="ghost" onClick={resetAll} title="Reset data">
            Refresh
          </button>

          {(isAdmin || isLoggedIn) && (
            <button className="ghost" onClick={resetForm} title="Clear form">
              Clear
            </button>
          )}
        </div>
      </header>

      <div className="content">
        {grouped.length === 0 ? (
          <div className="empty">No data yet.</div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {grouped.map(([month, arr]) => (
              <section className="group" key={month}>
                <div className="group-head">
                  <div className="group-date">{month}</div>
                  <div className="group-count">
                    {arr.length} Entr{arr.length > 1 ? "ies" : "y"}
                  </div>
                </div>

                <div style={{ display: "grid", gap: 14 }}>
                  {arr.map((it, idx) => (
                    <div
                      key={it.id}
                      style={{
                        background: "white",
                        borderRadius: 14,
                        padding: 16,
                        border: "1px solid rgba(0,0,0,0.06)",
                      }}
                    >
                      <Row label="S.No" value={String(idx + 1)} />
                      <Row label="Scholar / Activity" value={it.scholar} />
                      <Row label="Institution / Event" value={it.institution} />
                      <Row label="Mode" value={it.mode} />
                      <Row label="Date" value={it.date} />
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
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="panel bottom-form">
          <h2>{editingId ? "Edit DC Entry" : "Add DC Entry"}</h2>

          <form onSubmit={onSubmit} className="form">
            <label>
              Scholar / Activity
              <input
                value={form.scholar}
                onChange={(e) => setForm({ ...form, scholar: e.target.value })}
                placeholder="Scholar name or activity..."
              />
            </label>

            <label>
              Institution / Event
              <input
                value={form.institution}
                onChange={(e) => setForm({ ...form, institution: e.target.value })}
                placeholder="Institution / event..."
              />
            </label>

            <label>
              Mode
              <select
                value={form.mode}
                onChange={(e) => setForm({ ...form, mode: e.target.value })}
              >
                <option>Online</option>
                <option>Offline</option>
                <option>Hybrid</option>
              </select>
            </label>

            <label>
              Date
              <input
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                placeholder="12.01.2026"
              />
            </label>

            <label>
              Details
              <input
                value={form.details}
                onChange={(e) => setForm({ ...form, details: e.target.value })}
                placeholder="Full description..."
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
              Tip: Scholar, Institution, and Date are required.
            </div>
          </form>
        </div>
      )}

      <footer className="footer">Currently using raw data inside code.</footer>
    </div>
  );
}