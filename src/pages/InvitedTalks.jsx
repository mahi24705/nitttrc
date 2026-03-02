import { useEffect, useMemo, useState } from "react";
import "./InvitedTalks.css";

const STORAGE_KEY = "invited_talks_v1";

/* 🔹 INITIAL DATA (UNCHANGED CONTENT) */
const INITIAL_TALKS = [
  {
    date: "31.01.2026",
    title:
      'Dr.S.Sakthivel Murugan delivered a talk on “Role of EEE in underwater” at St.Josephs College of engineering on 29.01.2026'
  },
  {
    date: "31.12.2025",
    title:
      'Dr.S.Sakthivel Murugan delivered a talk on “Effective Proposal drafting for easy funding opportunity” in the five days brainstorming workshop on research proposal writing organized by Kongu engineering College on December 1-5, 2025'
  },
  {
    date: "29.09.2025",
    title:
      'Delivered a keynote address on “Underwater ROV” in the 4th International Conference on Engineering, Science and Technology (ICEST 2025) held at University Batanghari Jambi, Indonesia on 24.09.2025.'
  },
  {
    date: "29.09.2025",
    title:
      'Delivered Inauguration & Keynote on “State of Underwater Autonomy in India” in the “Dive into Autonomy: A 5-Day Hands-On Workshop on Autonomous Underwater Vehicles ” held at SRM University, kattankulathur on 22.09.2025.'
  },
  {
    date: "29.09.2025",
    title:
      'Delivered a talk on “Underwater wireless Communication” in the national seminar on ”the rise of blue finance” held at SRM University, kattankulathur on 11.09.2025.'
  },
  {
    date: "28.03.2025",
    title:
      'Invited Speaker and delivered a talk on “Underwater signal and Image Processing” at Green Revolution in Electronics Engineering and Networks Conference (GREENCON 2025) held on 20.03.2025 at VIT Chennai'
  },
  {
    date: "28.03.2025",
    title:
      'Delivered a talk on “Underwater Sensors - Active/passive and its application in Ocean” for the Faculty Development Program (FDP) on “AI/ML and IOT applications to multi-domain engineering fields - Hands on sessions” held at VIT Vellore on 19.03.2025'
  },
  {
    date: "28.10.2024",
    title:
      'Session Chair in an International Conference “ASIANComNet 2024 – 2024 Asian Conference on Communication and Networks” on 26.10.2024 FN.'
  },
  {
    date: "28.10.2024",
    title:
      'Delivered a talk on “Underwater Sensors and Its Applications” as keynote speaker in ASIANComNet 2024 on 26.10.2024 AN.'
  }
];

function normalize(s) {
  return (s || "").toLowerCase().trim();
}

function dateKey(ddmmyyyy) {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(ddmmyyyy || "");
  if (!m) return 0;
  const [, dd, mm, yy] = m;
  return Number(`${yy}${mm}${dd}`);
}

export default function InvitedTalks() {
  const [search, setSearch] = useState("");
  const [talks, setTalks] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_TALKS;
  });

  const [form, setForm] = useState({ date: "", title: "" });
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(talks));
  }, [talks]);

  const filtered = useMemo(() => {
    if (!search) return talks;
    return talks.filter((t) =>
      normalize(`${t.date} ${t.title}`).includes(normalize(search))
    );
  }, [talks, search]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const t of filtered) {
      if (!map.has(t.date)) map.set(t.date, []);
      map.get(t.date).push(t);
    }

    const entries = Array.from(map.entries());
    entries.sort((a, b) => dateKey(b[0]) - dateKey(a[0]));
    return entries;
  }, [filtered]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.date || !form.title) return;

    if (editIndex !== null) {
      const updated = talks.map((t, i) =>
        i === editIndex ? form : t
      );
      setTalks(updated);
    } else {
      setTalks([form, ...talks]);
    }

    setForm({ date: "", title: "" });
    setEditIndex(null);
  }

  function handleEdit(date, index) {
    const item = grouped
      .find(([d]) => d === date)[1][index];
    const globalIndex = talks.findIndex(
      (t) => t.date === item.date && t.title === item.title
    );
    setEditIndex(globalIndex);
    setForm(item);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDelete(date, index) {
    const item = grouped
      .find(([d]) => d === date)[1][index];
    setTalks(
      talks.filter(
        (t) => !(t.date === item.date && t.title === item.title)
      )
    );
  }

  return (
    <div className="page">
      <header className="hero">
        <div>
          <h1>Outside World Interaction</h1>
          <p>Invited Talks & Academic Contributions</p>
        </div>

        <input
          className="search"
          placeholder="Search by date or keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </header>

      <div className="content">
        {grouped.map(([date, arr]) => (
          <section key={date} className="group">
            <div className="group-head">
              <div className="group-date">{date}</div>
              <div className="group-count">
                {arr.length} Talk{arr.length > 1 ? "s" : ""}
              </div>
            </div>

            <div className="table">
              <div className="tr head">
                <div>S.No</div>
                <div>Details</div>
                <div>Action</div>
              </div>

              {arr.map((talk, idx) => (
                <div className="tr" key={idx}>
                  <div>{idx + 1}</div>
                  <div className="talk-title">{talk.title}</div>
                  <div className="actions">
                    <button
                      className="edit"
                      onClick={() => handleEdit(date, idx)}
                    >
                      Edit
                    </button>
                    <button
                      className="del"
                      onClick={() => handleDelete(date, idx)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="panel bottom-form">
        <h2>{editIndex !== null ? "Edit Talk" : "Add Talk"}</h2>

        <form onSubmit={handleSubmit} className="form">
          <label>
            Date (DD.MM.YYYY)
            <input
              value={form.date}
              onChange={(e) =>
                setForm({ ...form, date: e.target.value })
              }
            />
          </label>

          <label>
            Talk Details
            <textarea
              rows="4"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
            />
          </label>

          <div className="btns">
            <button className="primary">
              {editIndex !== null ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>

      <footer className="footer">
        Saved locally in browser (localStorage).
      </footer>
    </div>
  );
}