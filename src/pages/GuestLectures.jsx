import { useMemo, useState, useContext } from "react";
import "./AsCoordinator.css";
import { AuthContext } from "../context/AuthContext";

const RAW_TALKS = [
  {
    id: 1,
    month: "SEP 2011",
    date: "09.09.2011",
    title: "Issues and Challenges in Underwater Acoustic Communication",
    venue: "DRDO-sponsored Seminar",
    place: "National Engineering College, Kovilpati",
  },
  {
    id: 2,
    month: "JUL 2012",
    date: "27.07.2012 - 28.07.2012",
    title: "Handled classes for Govt. Higher Secondary School Teachers",
    venue: "HSC teacher’s orientation programme",
    place: "SSN College of Engineering",
  },
  {
    id: 3,
    month: "JUL 2017",
    date: "24.07.2017",
    title: "Introduction to communication system and evolution of Digital technology & Institution to Industry- Expectations and Challenges",
    venue: "Invited Lecture",
    place: "Mahendra Engineering College, Namakkal",
  },
  {
    id: 4,
    month: "SEP 2020",
    date: "24.09.2020",
    title: "Underwater sensors",
    venue: "FDP “Sensor Technologies”",
    place: "National Institute of Engineering (NIE), Mysuru",
  },
  {
    id: 5,
    month: "SEP 2021",
    date: "29.09.2021",
    title: "Challenges in underwater data collection for various applications",
    venue: "Invited Lecture",
    place: "K S School of Engineering and Management, Bangalore",
  },
  {
    id: 6,
    month: "DEC 2021",
    date: "06.12.2021",
    title: "Underwater Communication",
    venue: "ATAL online FDP",
    place: "Mahendra Engineering College",
  },
  {
    id: 7,
    month: "DEC 2021",
    date: "11.12.2021",
    title: "Underwater Antennas",
    venue: "ATAL online FDP",
    place: "Mailam Engineering College",
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
    JAN: "01", FEB: "02", MAR: "03", APR: "04", MAY: "05", JUN: "06",
    JUL: "07", AUG: "08", SEP: "09", OCT: "10", NOV: "11", DEC: "12",
  };

  return Number(`${m[2]}${months[m[1]]}00`);
}

function monthFromDate(ddmmyyyy) {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(ddmmyyyy || "");
  if (!m) return "—";
  const [, , mm, yyyy] = m;
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
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

export default function GuestLectures() {
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
    setForm({ date: "", title: "", venue: "", place: "" });
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
    if (!window.confirm("Delete this guest lecture?")) return;
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
      alert("Please fill Date, Title, Venue/Context, and Place.");
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
          <h1>Guest Lectures</h1>
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
                    {arr.length} Lecture{arr.length > 1 ? "s" : ""}
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
                      <Row label="Venue / Context" value={it.venue} />
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
          <h2>{editingId ? "Edit Guest Lecture" : "Add Guest Lecture"}</h2>

          <form onSubmit={onSubmit} className="form">
            <label>
              Date
              <input
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                placeholder="24.09.2020"
              />
            </label>

            <label>
              Title
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Lecture title..."
              />
            </label>

            <label>
              Venue / Context
              <input
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                placeholder="FDP / Seminar / Orientation..."
              />
            </label>

            <label>
              Place
              <input
                value={form.place}
                onChange={(e) => setForm({ ...form, place: e.target.value })}
                placeholder="Institution name..."
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
          </form>
        </div>
      )}
    </div>
  );
}