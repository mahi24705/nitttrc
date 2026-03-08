import { useMemo, useState, useContext } from "react";
import "./AsCoordinator.css";
import { AuthContext } from "../context/AuthContext";

const RAW_TALKS = [
  {
    id: 1,
    month: "OCT 2024",
    date: "26.10.2024",
    title: "Underwater Sensors and Its Applications",
    venue:
      'International Conference "ASIANComNet 2024 – 2024 Asian Conference on Communication and Networks"',
    place: "Thailand",
  },
  {
    id: 2,
    month: "OCT 2024",
    date: "26.10.2024",
    title: "Session Chair in ASIANComNet 2024",
    venue:
      'International Conference "ASIANComNet 2024 – 2024 Asian Conference on Communication and Networks"',
    place: "Thailand",
  },
  {
    id: 3,
    month: "MAR 2025",
    date: "19.03.2025",
    title: "Underwater Sensors - Active/passive and its application in Ocean",
    venue:
      'Faculty Development Program (FDP) on "AI/ML and IOT applications to multi-domain engineering fields - Hands on sessions"',
    place: "VIT Vellore",
  },
  {
    id: 4,
    month: "MAR 2025",
    date: "20.03.2025",
    title: "Underwater signal and Image Processing",
    venue:
      "Green Revolution in Electronics Engineering and Networks Conference (GREENCON 2025)",
    place: "VIT Chennai",
  },
  {
    id: 5,
    month: "SEP 2025",
    date: "24.09.2025",
    title: "Underwater ROV",
    venue:
      "4th International Conference on Engineering, Science and Technology (ICEST 2025)",
    place: "University Batanghari Jambi, Indonesia",
  },
  {
    id: 6,
    month: "SEP 2025",
    date: "22.09.2025",
    title: "State of Underwater Autonomy in India",
    venue:
      "Dive into Autonomy: A 5-Day Hands-On Workshop on Autonomous Underwater Vehicles",
    place: "SRM University, Kattankulathur",
  },
  {
    id: 7,
    month: "SEP 2025",
    date: "11.09.2025",
    title: "Underwater wireless Communication",
    venue: 'National Seminar on "The Rise of Blue Finance"',
    place: "SRM University, Kattankulathur",
  },
  {
    id: 8,
    month: "DEC 2025",
    date: "01.12.2025",
    title: "Effective Proposal drafting for easy funding opportunity",
    venue: "Five Days Brainstorming Workshop on Research Proposal Writing",
    place: "Kongu Engineering College",
  },
  {
    id: 9,
    month: "JAN 2026",
    date: "29.01.2026",
    title: "Role of EEE in underwater",
    venue: "Invited Talk",
    place: "St. Joseph's College of Engineering",
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

export default function InvitedTalks() {
  const { user, isAdmin } = useContext(AuthContext);
  const isLoggedIn = !!user;

  const [q, setQ] = useState("");
  const [items, setItems] = useState(RAW_TALKS);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    date: "",
    title: "",
    venue: "",
    place: "",
  });

  const filteredItems = useMemo(() => {
    const query = normalize(q);
    if (!query) return items;

    return items.filter((it) =>
      normalize(`${it.month} ${it.date} ${it.title} ${it.venue} ${it.place}`).includes(query)
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
      date: "",
      title: "",
      venue: "",
      place: "",
    });
  }

  function resetAll() {
    setQ("");
    resetForm();
    setItems(RAW_TALKS);
  }

  function onEdit(item) {
    setEditingId(item.id);
    setForm({
      date: item.date || "",
      title: item.title || "",
      venue: item.venue || "",
      place: item.place || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onDelete(id) {
    if (!window.confirm("Delete this invited talk?")) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  function onSubmit(e) {
    e.preventDefault();

    const payload = {
      date: String(form.date || "").trim(),
      title: String(form.title || "").trim(),
      venue: String(form.venue || "").trim(),
      place: String(form.place || "").trim(),
    };

    if (!payload.date || !payload.title || !payload.venue || !payload.place) {
      alert("Please fill Date, Title, Venue/Conference, and Place.");
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
          <h1>Invited Talks</h1>
          <p>Title / Venue / Date / Place</p>
        </div>

        <div className="hero-right">
          <input
            className="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search: month / title / venue / place..."
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
                    {arr.length} Talk{arr.length > 1 ? "s" : ""}
                  </div>
                </div>

                <div style={{ display: "grid", gap: 14, background: "transparent" }}>
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
                      <Row label="Title" value={it.title} />
                      <Row label="Venue / Conference" value={it.venue} />
                      <Row label="Date" value={it.date} />
                      <Row label="Place" value={it.place} />

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
          <h2>{editingId ? "Edit Invited Talk" : "Add Invited Talk"}</h2>

          <form onSubmit={onSubmit} className="form">
            <label>
              Date
              <input
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                placeholder="29.01.2026"
              />
            </label>

            <label>
              Title
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Talk title..."
              />
            </label>

            <label>
              Venue / Conference
              <input
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                placeholder="Conference / event..."
              />
            </label>

            <label>
              Place
              <input
                value={form.place}
                onChange={(e) => setForm({ ...form, place: e.target.value })}
                placeholder="Thailand / VIT Vellore / SRM..."
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
              Tip: Date, Title, Venue/Conference, and Place are required.
            </div>
          </form>
        </div>
      )}

      <footer className="footer">Currently using raw data inside code.</footer>
    </div>
  );
}